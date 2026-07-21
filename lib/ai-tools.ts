// Central registry of AI tools the platform can connect to.
// Exactly one tool is a real, working integration (`integration: "live"`);
// the rest are placeholders (`integration: "coming_soon"`) shown in the UI but
// not yet wired up. The problem statement allows simulated integrations as long
// as at least one is real — swapping which tool is "live" is a one-line change.

export type ToolIntegration = "live" | "coming_soon";

export interface AiToolDef {
  id: string;
  name: string;
  vendor: string;
  description: string;
  integration: ToolIntegration;
  /** Tailwind classes for the tool's letter-avatar. */
  accent: string;
}

export const AI_TOOLS: AiToolDef[] = [
  {
    id: "groq",
    name: "Groq",
    vendor: "Groq (Llama 3.3)",
    description: "Fast open-model inference. Integration ready — coming soon.",
    integration: "coming_soon",
    accent: "bg-rose-100 text-rose-700",
  },
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    description: "Chat & coding assistant. Live integration — prompts sent here are captured as real usage events.",
    integration: "live",
    accent: "bg-orange-100 text-orange-700",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    description: "Conversational assistant for writing, analysis, and code.",
    integration: "coming_soon",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    description: "AI-native code editor with inline chat and autocomplete.",
    integration: "coming_soon",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    description: "In-editor code completion and chat.",
    integration: "coming_soon",
    accent: "bg-slate-200 text-slate-700",
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    description: "Multimodal assistant for text, code, and images.",
    integration: "coming_soon",
    accent: "bg-indigo-100 text-indigo-700",
  },
];

export function getTool(id: string): AiToolDef | undefined {
  return AI_TOOLS.find((t) => t.id === id);
}

export function isLiveTool(id: string): boolean {
  return getTool(id)?.integration === "live";
}

/** The single tool with a real, working integration. */
export function getLiveTool(): AiToolDef {
  const live = AI_TOOLS.find((t) => t.integration === "live");
  if (!live) throw new Error("No live AI tool is configured.");
  return live;
}
