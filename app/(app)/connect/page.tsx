import { createClient } from "@/lib/supabase/server";
import { ConnectionsGrid } from "@/components/connect/connections-grid";
import type { ToolConnection } from "@/lib/types";

export default async function ConnectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("tool_connections")
    .select("*")
    .eq("user_id", user!.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Connect</h1>
        <p className="text-muted-foreground">
          Connect an AI tool to start capturing usage events. Claude is live —
          other integrations are coming soon.
        </p>
      </div>
      <ConnectionsGrid
        initialConnections={(connections ?? []) as ToolConnection[]}
      />
    </div>
  );
}
