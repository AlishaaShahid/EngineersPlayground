import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTool, isLiveTool } from "@/lib/ai-tools";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** GET: all of the user's tool connections (optionally ?tool=<id>). */
export async function GET(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tool = request.nextUrl.searchParams.get("tool");
  let query = supabase.from("tool_connections").select("*").eq("user_id", user.id);
  if (tool) query = query.eq("tool", tool);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ connections: data ?? [] });
}

/** POST ?tool=<id>: connect a tool. Only "live" tools may be connected. */
export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tool = request.nextUrl.searchParams.get("tool") ?? "";
  if (!getTool(tool)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
  }
  if (!isLiveTool(tool)) {
    return NextResponse.json(
      { error: "This integration is coming soon and can't be connected yet." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("tool_connections")
    .upsert(
      {
        user_id: user.id,
        tool,
        status: "connected",
        connected_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tool" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection: data });
}

/** DELETE ?tool=<id>: disconnect a tool. */
export async function DELETE(request: NextRequest) {
  const { supabase, user } = await requireUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tool = request.nextUrl.searchParams.get("tool") ?? "";
  if (!getTool(tool)) {
    return NextResponse.json({ error: "Unknown tool." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tool_connections")
    .update({ status: "disconnected", connected_at: null })
    .eq("user_id", user.id)
    .eq("tool", tool)
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ connection: data });
}
