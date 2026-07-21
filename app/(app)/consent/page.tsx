import Link from "next/link";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AI_TOOLS } from "@/lib/ai-tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DATA_WE_COLLECT = [
  {
    field: "Prompt text",
    why: "Needed to generate the reply and to extract the skills/category/tags below.",
  },
  {
    field: "Category, tags, skills, summary",
    why: "Derived from your prompt by Claude — powers your Intelligence page and org-wide recommendations.",
  },
  {
    field: "Tool + timestamp",
    why: "Powers adoption and usage-trend analytics.",
  },
];

export default async function ConsentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: connections } = await supabase
    .from("tool_connections")
    .select("tool, status")
    .eq("user_id", user!.id);

  const statusByTool = new Map(
    (connections ?? []).map((c) => [c.tool, c.status])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Consent</h1>
        <p className="text-muted-foreground">
          AI-Hub only captures usage events for tools you explicitly connect.
          Disconnect anytime to stop capture immediately.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" /> What we collect, and why
          </CardTitle>
          <CardDescription>
            Full transparency — nothing is captured beyond what&apos;s listed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {DATA_WE_COLLECT.map((item) => (
            <div key={item.field} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.field}</p>
              <p className="text-muted-foreground">{item.why}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your consent status, per tool</CardTitle>
          <CardDescription>
            Only tools marked Connected are ever captured.{" "}
            <Link href="/connect" className="underline">
              Manage connections
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {AI_TOOLS.map((tool) => {
            const connected = statusByTool.get(tool.id) === "connected";
            return (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <span className="font-medium">{tool.name}</span>
                {connected ? (
                  <Badge className="gap-1">
                    <CheckCircle2 className="size-3.5" /> Consented
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <XCircle className="size-3.5" /> Not consented
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How your data is protected</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            • Row Level Security is enabled on every table — you can only ever
            read or write your own events and connections, enforced by
            Postgres, not application code.
          </p>
          <p>
            • The service-role key that bypasses those protections is
            backend-only and never reaches the browser.
          </p>
          <p>
            • Aggregate analytics (Dashboard) never expose an individual
            employee&apos;s raw prompts.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
