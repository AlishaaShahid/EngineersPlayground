"use client";

// MVP dashboard: illustrative/mock analytics. Real events flow through
// ai_events (see /events, /api/events) — swapping this file's MOCK_* consts
// for Supabase aggregate queries is the follow-up once there's enough
// captured volume to make the charts meaningful.

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_KPIS = [
  {
    label: "AI Adoption",
    value: "68%",
    detail: "34 of 50 employees active this month",
    icon: Users,
  },
  {
    label: "Events Captured",
    value: "1,204",
    detail: "+18% vs. last week",
    icon: Activity,
  },
  {
    label: "AI Effectiveness",
    value: "91%",
    detail: "of captured events rated helpful",
    icon: Award,
  },
  {
    label: "Time Saved",
    value: "134 hrs",
    detail: "estimated this month, org-wide",
    icon: TrendingUp,
  },
];

const MOCK_TOOL_POPULARITY = [
  { tool: "Claude", events: 512 },
  { tool: "Cursor", events: 341 },
  { tool: "ChatGPT", events: 198 },
  { tool: "Copilot", events: 103 },
  { tool: "Gemini", events: 50 },
];

const MOCK_TEAM_ADOPTION = [
  { team: "Engineering", adoption: 82 },
  { team: "Design", adoption: 61 },
  { team: "Marketing", adoption: 47 },
  { team: "Data", adoption: 74 },
];

const MOCK_TOP_SKILLS = [
  "Prompt engineering",
  "React",
  "SQL",
  "Debugging",
  "API design",
  "Data analysis",
];

const MOCK_RECOMMENDATIONS = [
  {
    task: "Code review & debugging",
    tool: "Claude",
    confidence: "87% success rate across 92 similar events",
  },
  {
    task: "Quick data lookups & summarization",
    tool: "Groq (Llama 3.3)",
    confidence: "Fastest response time, 74 similar events",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Organizational AI adoption and intelligence at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_KPIS.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{value}</div>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tool popularity</CardTitle>
            <CardDescription>Captured events by AI tool, this month</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_TOOL_POPULARITY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tool" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="events" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team-level adoption</CardTitle>
            <CardDescription>Share of each team actively using AI tools</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {MOCK_TEAM_ADOPTION.map(({ team, adoption }) => (
              <div key={team} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{team}</span>
                  <span className="text-muted-foreground">{adoption}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${adoption}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="size-4" /> Top skills across the org
            </CardTitle>
            <CardDescription>Inferred from captured prompt content</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {MOCK_TOP_SKILLS.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendation insights</CardTitle>
            <CardDescription>Explainable, usage-backed tool suggestions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {MOCK_RECOMMENDATIONS.map((rec) => (
              <div key={rec.task} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{rec.task}</p>
                <p className="text-muted-foreground">
                  Use <span className="font-medium text-foreground">{rec.tool}</span> — {rec.confidence}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
