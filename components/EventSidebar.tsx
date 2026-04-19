"use client";

import { Event } from "@/lib/mock-events";
import { TYPE_COLORS } from "@/lib/event-colors";

type Props = {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
};

export default function EventSidebar({ events, selectedEvent, onEventClick }: Props) {
  return (
    <div className="w-80 flex flex-col border-l border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">No events in this area.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {events.map((event) => {
              const color = TYPE_COLORS[event.type] ?? TYPE_COLORS["default"];
              const isSelected = selectedEvent?.id === event.id;
              return (
                <li key={event.id}>
                  <button
                    onClick={() => onEventClick(event)}
                    className={`w-full text-left px-4 py-3 flex gap-3 items-start transition hover:bg-slate-50 ${
                      isSelected ? "bg-emerald-50" : ""
                    }`}
                  >
                    <span
                      className="mt-1 shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate leading-snug">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>
                    <span
                      className="shrink-0 mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white leading-none"
                      style={{ backgroundColor: color }}
                    >
                      {event.type}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
