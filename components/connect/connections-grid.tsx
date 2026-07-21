"use client";

import { useState } from "react";
import { AI_TOOLS } from "@/lib/ai-tools";
import type { ToolConnection } from "@/lib/types";
import { ConnectionCard } from "./connection-card";

export function ConnectionsGrid({
  initialConnections,
}: {
  initialConnections: ToolConnection[];
}) {
  // Keyed by tool id for O(1) lookup and updates.
  const [connections, setConnections] = useState<Record<string, ToolConnection>>(
    () => Object.fromEntries(initialConnections.map((c) => [c.tool, c]))
  );

  function handleChange(toolId: string, connection: ToolConnection | null) {
    setConnections((prev) => {
      const next = { ...prev };
      if (connection) next[toolId] = connection;
      else delete next[toolId];
      return next;
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {AI_TOOLS.map((tool) => (
        <ConnectionCard
          key={tool.id}
          tool={tool}
          connection={connections[tool.id] ?? null}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
