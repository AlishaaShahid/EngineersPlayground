import type { AiEvent } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EventStatusBadge } from "./event-status-badge";

function Chips({ values }: { values: string[] }) {
  if (!values.length) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((v) => (
        <Badge key={v} variant="outline" className="font-normal">
          {v}
        </Badge>
      ))}
    </div>
  );
}

export function EventsTable({ events }: { events: AiEvent[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[240px]">Prompt</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Skills</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="whitespace-nowrap">Timestamp</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="max-w-[320px]">
                <p className="truncate font-medium" title={event.prompt}>
                  {event.prompt}
                </p>
                {event.summary && (
                  <p className="truncate text-xs text-muted-foreground">
                    {event.summary}
                  </p>
                )}
              </TableCell>
              <TableCell>
                {event.category ? (
                  <Badge variant="secondary">{event.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Chips values={event.skills} />
              </TableCell>
              <TableCell>
                <Chips values={event.tags} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {new Date(event.created_at).toLocaleString()}
              </TableCell>
              <TableCell>
                <EventStatusBadge status={event.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
