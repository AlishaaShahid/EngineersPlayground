import "server-only";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "Missing ANTHROPIC_API_KEY. Add it to .env (backend-only — never NEXT_PUBLIC_)."
  );
}

// Single shared Anthropic client. server-only makes importing this from a
// Client Component a build error, so the API key never reaches the browser.
export const anthropic = new Anthropic();

// Centralized so every Claude call in the app uses the same model. Swap to
// "claude-haiku-4-5" if you want cheaper/faster metadata extraction.
export const CLAUDE_MODEL = "claude-opus-4-8";
