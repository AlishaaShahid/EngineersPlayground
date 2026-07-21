import "server-only";
import { anthropic, CLAUDE_MODEL } from "./client";

/** Send a prompt to Claude and return its text reply (real API call). */
export async function chatWithClaude(prompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text response.");
  }
  return textBlock.text;
}
