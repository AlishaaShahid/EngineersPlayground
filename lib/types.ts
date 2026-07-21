export type ConnectionStatus = "connected" | "disconnected";

export interface ToolConnection {
  id: string;
  user_id: string;
  tool: string;
  status: ConnectionStatus;
  connected_at: string | null;
  created_at: string;
}

export type EventStatus = "processing" | "completed" | "failed";

export interface AiEvent {
  id: string;
  user_id: string;
  tool: string;
  prompt: string;
  category: string | null;
  tags: string[];
  skills: string[];
  summary: string | null;
  status: EventStatus;
  created_at: string;
}

/** Structured metadata Claude extracts from a prompt. */
export interface ExtractedMetadata {
  category: string;
  tags: string[];
  skills: string[];
  summary: string;
}
