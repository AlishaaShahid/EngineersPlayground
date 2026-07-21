import { Badge } from "@/components/ui/badge";
import type { EventStatus } from "@/lib/types";

const LABELS: Record<EventStatus, string> = {
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  if (status === "completed") {
    return <Badge className="bg-emerald-600 text-white">{LABELS[status]}</Badge>;
  }
  if (status === "failed") {
    return <Badge variant="destructive">{LABELS[status]}</Badge>;
  }
  return <Badge variant="secondary">{LABELS[status]}</Badge>;
}
