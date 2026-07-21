import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatWithClaude } from "@/lib/ai/chat";
import { extractMetadata } from "@/lib/ai/extract-metadata";

const MAX_PROMPT_LENGTH = 8000;

/**
 * Real Claude integration. The user chats with Claude through the app, so each
 * prompt is a genuine, captured AI usage event:
 * 1. Verify Claude is connected (consent gate).
 * 2. Save the prompt as an ai_event ('processing').
 * 3. Call Claude for a real reply AND extract metadata (in parallel).
 * 4. Persist the enriched event; return Claude's reply + the saved event.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Consent gate: Claude must be explicitly connected before we capture events.
  const { data: connection } = await supabase
    .from("tool_connections")
    .select("status")
    .eq("user_id", user.id)
    .eq("tool", "claude")
    .maybeSingle();
  if (connection?.status !== "connected") {
    return NextResponse.json(
      { error: "Connect Claude first to capture events." },
      { status: 403 }
    );
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

  // 1. Save the raw event.
  const { data: inserted, error: insertError } = await supabase
    .from("ai_events")
    .insert({ user_id: user.id, tool: "claude", prompt, status: "processing" })
    .select()
    .single();
  if (insertError || !inserted) {
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to save event." },
      { status: 500 }
    );
  }

  // 2. Real Claude reply is required; metadata enrichment is best-effort.
  const [replyResult, metaResult] = await Promise.allSettled([
    chatWithClaude(prompt),
    extractMetadata(prompt),
  ]);

  if (replyResult.status === "rejected") {
    console.error("Claude chat failed:", replyResult.reason);
    const { data: failed } = await supabase
      .from("ai_events")
      .update({ status: "failed" })
      .eq("id", inserted.id)
      .eq("user_id", user.id)
      .select()
      .single();
    return NextResponse.json(
      { error: "Claude did not respond. Please try again.", event: failed ?? inserted },
      { status: 502 }
    );
  }

  const metadata =
    metaResult.status === "fulfilled" ? metaResult.value : null;

  const { data: updated } = await supabase
    .from("ai_events")
    .update({
      category: metadata?.category ?? null,
      tags: metadata?.tags ?? [],
      skills: metadata?.skills ?? [],
      summary: metadata?.summary ?? null,
      status: "completed",
    })
    .eq("id", inserted.id)
    .eq("user_id", user.id)
    .select()
    .single();

  return NextResponse.json(
    {
      reply: replyResult.value,
      event: updated ?? inserted,
      warning: metadata ? undefined : "Saved, but metadata extraction failed.",
    },
    { status: 201 }
  );
}
