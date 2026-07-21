"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import type { AiEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export function ClaudeConsole({
  disabled,
  onCaptured,
}: {
  disabled?: boolean;
  onCaptured: (event: AiEvent) => void;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send() {
    const text = prompt.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    setTurns((prev) => [...prev, { role: "user", text }]);
    setPrompt("");

    try {
      const res = await fetch("/api/claude/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Claude request failed.");
      setTurns((prev) => [...prev, { role: "assistant", text: body.reply }]);
      onCaptured(body.event as AiEvent);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Claude console</CardTitle>
        <CardDescription>
          Chat with Claude. Every prompt is captured as a real AI usage event
          and enriched automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {turns.length > 0 && (
          <div
            ref={scrollRef}
            className="flex max-h-80 flex-col gap-3 overflow-y-auto rounded-lg border bg-muted/30 p-3"
          >
            {turns.map((turn, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  turn.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm",
                    turn.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border"
                  )}
                >
                  {turn.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Claude is thinking…
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-end gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Claude anything… (Enter to send, Shift+Enter for newline)"
            rows={2}
            disabled={disabled || loading}
          />
          <Button
            onClick={send}
            disabled={disabled || loading || prompt.trim().length === 0}
            className="gap-1.5"
          >
            <Send className="size-4" />
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
