"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Search } from "lucide-react";
import type { AiEvent } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ClaudeConsole } from "@/components/claude/claude-console";
import { EventsTable } from "./events-table";

const ALL_CATEGORIES = "__all__";

export function EventsView() {
  const [events, setEvents] = useState<AiEvent[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);

  useEffect(() => {
    async function load() {
      try {
        const [eventsRes, connRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/connections"),
        ]);
        const eventsBody = await eventsRes.json();
        const connBody = await connRes.json();
        if (!eventsRes.ok) throw new Error(eventsBody.error ?? "Failed to load events.");
        setEvents(eventsBody.events ?? []);
        const claude = (connBody.connections ?? []).find(
          (c: { tool: string; status: string }) => c.tool === "claude"
        );
        setConnected(claude?.status === "connected");
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) if (e.category) set.add(e.category);
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (category !== ALL_CATEGORIES && e.category !== category) return false;
      if (!q) return true;
      return (
        e.prompt.toLowerCase().includes(q) ||
        (e.summary?.toLowerCase().includes(q) ?? false) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [events, search, category]);

  function handleCaptured(event: AiEvent) {
    setEvents((prev) => [event, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-muted-foreground">
          Capture AI usage events and see them enriched by Claude.
        </p>
      </div>

      {connected === false && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Claude isn&apos;t connected.{" "}
          <Link href="/connect" className="font-medium underline">
            Connect it first
          </Link>{" "}
          to capture events.
        </div>
      )}

      <ClaudeConsole disabled={connected !== true} onCaptured={handleCaptured} />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts, tags, skills…"
              className="pl-9"
            />
          </div>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? ALL_CATEGORIES)}
          >
            <SelectTrigger className="sm:w-56">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : loadError ? (
          <p className="text-sm text-destructive">{loadError}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
            <Activity className="size-8 text-muted-foreground" />
            <p className="font-medium">
              {events.length === 0 ? "No events yet" : "No matching events"}
            </p>
            <p className="text-sm text-muted-foreground">
              {events.length === 0
                ? "Capture your first AI event above to see it here."
                : "Try a different search or category filter."}
            </p>
          </div>
        ) : (
          <EventsTable events={filtered} />
        )}
      </div>
    </div>
  );
}
