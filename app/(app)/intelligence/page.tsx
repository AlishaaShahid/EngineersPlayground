import { BrainCircuit, Sparkles, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AiEvent } from "@/lib/types";

/** Count occurrences, sorted by frequency, most common first. */
function topByFrequency(values: string[], limit: number) {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default async function IntelligencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("ai_events")
    .select("*")
    .eq("user_id", user!.id)
    .eq("status", "completed");

  const completed = (events ?? []) as AiEvent[];

  const skillCounts = topByFrequency(completed.flatMap((e) => e.skills), 8);
  const categoryCounts = topByFrequency(
    completed.map((e) => e.category).filter((c): c is string => !!c),
    5
  );
  const toolCounts = topByFrequency(completed.map((e) => e.tool), 5);
  const preferredTool = toolCounts[0]?.[0] ?? null;
  const topCategory = categoryCounts[0]?.[0] ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Intelligence</h1>
        <p className="text-muted-foreground">
          Skills, persona, and tool preferences inferred live from your captured
          AI events — not hardcoded.
        </p>
      </div>

      {completed.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
          <BrainCircuit className="size-8 text-muted-foreground" />
          <p className="font-medium">No intelligence yet</p>
          <p className="text-sm text-muted-foreground">
            Capture a few AI events on the Events page — insights build up
            automatically from there.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" /> Top skills
              </CardTitle>
              <CardDescription>
                Extracted from {completed.length} captured event
                {completed.length === 1 ? "" : "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {skillCounts.map(([skill, count]) => (
                <Badge key={skill} variant="secondary">
                  {skill} · {count}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4" /> Preferred tool
              </CardTitle>
              <CardDescription>Most-used AI tool, by event count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold capitalize">
                {preferredTool ?? "—"}
              </div>
              <div className="mt-3 flex flex-col gap-1">
                {toolCounts.map(([tool, count]) => (
                  <div
                    key={tool}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span className="capitalize">{tool}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="size-4" /> Working style
              </CardTitle>
              <CardDescription>Dominant work category (persona proxy)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{topCategory ?? "—"}</div>
              <div className="mt-3 flex flex-col gap-1">
                {categoryCounts.map(([category, count]) => (
                  <div
                    key={category}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>{category}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
