import "server-only";
import { anthropic, CLAUDE_MODEL } from "./client";
import type { ExtractedMetadata } from "@/lib/types";

// JSON Schema for structured output. The API constrains Claude's response to
// exactly this shape, so we never have to defensively parse free-form text.
// (Structured-output schemas require additionalProperties:false + required.)
const METADATA_SCHEMA = {
  type: "object",
  properties: {
    category: {
      type: "string",
      description:
        "A single concise category for the task, e.g. 'Code generation', 'Debugging', 'Data analysis', 'Writing'. Infer it — do not pick from a fixed list.",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3-6 lowercase topical tags describing the prompt.",
    },
    skills: {
      type: "array",
      items: { type: "string" },
      description:
        "Technical skills or tools the prompt demonstrates, e.g. 'React', 'SQL', 'API design'.",
    },
    summary: {
      type: "string",
      description: "One short sentence summarizing what the user asked for.",
    },
  },
  required: ["category", "tags", "skills", "summary"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT =
  "You analyze a single AI-tool prompt written by an employee and extract structured metadata about it. " +
  "Infer the category, tags, and skills from the prompt's content — never invent details that aren't implied. " +
  "Keep tags and skills short. Respond only with the structured object.";

/**
 * Send a captured prompt to Claude and return structured metadata.
 * Throws on API/parse failure — callers decide how to record the failure.
 */
export async function extractMetadata(
  prompt: string
): Promise<ExtractedMetadata> {
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: METADATA_SCHEMA } },
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content for metadata extraction.");
  }

  const parsed = JSON.parse(textBlock.text) as ExtractedMetadata;
  return {
    category: parsed.category,
    tags: Array.isArray(parsed.tags) ? parsed.tags : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    summary: parsed.summary,
  };
}
