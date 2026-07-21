import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractMetadata } from "@/lib/ai/extract-metadata";

const MAX_PROMPT_LENGTH = 8000;

/** GET: list the user's events, newest first. Optional ?search= and ?category=. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const search = searchParams.get("search")?.trim();
  const category = searchParams.get("category")?.trim();

  let query = supabase
    .from("ai_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }
  if (search) {
    // Escape %,_ and commas so user input can't alter the filter grammar.
    const safe = search.replace(/[%_,]/g, "\\$&");
    query = query.or(`prompt.ilike.%${safe}%,summary.ilike.%${safe}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data });
}

/**
 * POST: capture an event, then enrich it with Claude.
 * 1. Insert the row as 'processing'.
 * 2. Ask Claude for structured metadata.
 * 3. Update the row to 'completed' (or 'failed' if extraction throws).
 * The saved event is returned either way.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { prompt?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt must be under ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 }
    );
  }

  // 1. Save the raw event immediately.
  const { data: inserted, error: insertError } = await supabase
    .from("ai_events")
    .insert({ user_id: user.id, tool: "cursor", prompt, status: "processing" })
    .select()
    .single();

  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save event." },
      { status: 500 }
    );
  }

  // 2 + 3. Enrich with Claude, then persist the outcome.
  try {
    const metadata = await extractMetadata(prompt);
    const { data: updated, error: updateError } = await supabase
      .from("ai_events")
      .update({
        category: metadata.category,
        tags: metadata.tags,
        skills: metadata.skills,
        summary: metadata.summary,
        status: "completed",
      })
      .eq("id", inserted.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(updateError?.message ?? "Failed to save metadata.");
    }

    return NextResponse.json({ event: updated }, { status: 201 });
  } catch (err) {
    console.error("Metadata extraction failed:", err);
    const { data: failed } = await supabase
      .from("ai_events")
      .update({ status: "failed" })
      .eq("id", inserted.id)
      .eq("user_id", user.id)
      .select()
      .single();

    return NextResponse.json(
      {
        event: failed ?? inserted,
        warning: "Event saved, but AI metadata extraction failed.",
      },
      { status: 201 }
    );
  }
}
