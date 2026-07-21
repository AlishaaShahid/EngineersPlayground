"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { AiToolDef } from "@/lib/ai-tools";
import type { ToolConnection } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function ConnectionCard({
  tool,
  connection,
  onChange,
}: {
  tool: AiToolDef;
  connection: ToolConnection | null;
  onChange: (toolId: string, connection: ToolConnection | null) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLive = tool.integration === "live";
  const isConnected = connection?.status === "connected";

  async function mutate(method: "POST" | "DELETE") {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/connections?tool=${tool.id}`, { method });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Request failed.");
      onChange(tool.id, body.connection);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg text-sm font-semibold",
              tool.accent
            )}
          >
            {tool.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <CardTitle className="truncate">{tool.name}</CardTitle>
            <CardDescription>{tool.vendor}</CardDescription>
          </div>
          <div className="ml-auto">
            {isConnected ? (
              <Badge className="gap-1">
                <CheckCircle2 className="size-3.5" /> Connected
              </Badge>
            ) : isLive ? (
              <Badge variant="secondary">Not connected</Badge>
            ) : (
              <Badge variant="outline">Coming soon</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm text-muted-foreground">{tool.description}</p>

        {isConnected && (
          <p className="text-xs text-muted-foreground">
            Connected {formatTime(connection?.connected_at ?? null)}
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="mt-auto">
          {!isLive ? (
            <Button variant="secondary" disabled>
              Coming soon
            </Button>
          ) : isConnected ? (
            <Button
              variant="outline"
              disabled={loading}
              onClick={() => mutate("DELETE")}
            >
              {loading ? "Disconnecting…" : "Disconnect"}
            </Button>
          ) : (
            <Button disabled={loading} onClick={() => mutate("POST")}>
              {loading ? "Connecting…" : `Connect ${tool.name}`}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
