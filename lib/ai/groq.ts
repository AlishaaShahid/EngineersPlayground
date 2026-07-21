import "server-only";

// Groq exposes an OpenAI-compatible chat-completions API. We call it with a
// plain fetch (no SDK needed). GROK_API_KEY holds the Groq key (gsk_...).
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Centralized so every LLM call in the app uses the same model.
export const GROQ_MODEL = "llama-3.3-70b-versatile";

if (!process.env.GROK_API_KEY) {
  throw new Error(
    "Missing GROK_API_KEY. Add your Groq key to .env (backend-only — never NEXT_PUBLIC_)."
  );
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function groqChat(opts: {
  messages: GroqMessage[];
  maxTokens?: number;
  /** Force a JSON object response (prompt must mention "json"). */
  jsonMode?: boolean;
}): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: opts.messages,
      max_tokens: opts.maxTokens ?? 1024,
      ...(opts.jsonMode
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq API error ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Groq returned no content.");
  }
  return content;
}
