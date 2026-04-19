"use client";

import { Event } from "@/lib/mock-events";
import { TYPE_COLORS } from "@/lib/event-colors";
import { MapPin } from "lucide-react";

type Props = {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
};

export default function EventSidebar({ events, selectedEvent, onEventClick }: Props) {
  // Filter events to only show those after today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    return eventDate >= today;
  });

  return (
    <div className="w-[420px] flex flex-col border-l border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 shrink-0">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scrollable Cards Container - Hidden Scrollbar */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {filteredEvents.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-400 text-center">No events in this area.</p>
        ) : (
          <div className="flex flex-col gap-3 p-4">
            {filteredEvents.map((event) => {
              const isSelected = selectedEvent?.id === event.id;
              const formattedDate = new Date(event.date + "T00:00:00").toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );

              return (
                <button
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl transition-all duration-300 ease-out backdrop-blur-md hover:scale-102 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isSelected
                      ? "bg-white/40 border border-white/60 shadow-lg scale-102"
                      : "bg-white/20 border border-white/30 hover:bg-white/30 hover:border-white/40"
                  }`}
                >
                  {/* Image Container */}
                  {event.picture ? (
                    <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                      <img
                        src={event.picture}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-slate-200 to-slate-300" />
                  )}

                  {/* Content Container */}
                  <div className="flex flex-col gap-2 p-3">
                    {/* Title */}
                    <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Overview - Max 2 lines */}
                    {event.overview && (
                      <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                        {event.overview}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="flex flex-col gap-1 pt-1">
                      {/* Date */}
                      <p className="text-xs text-slate-600">{formattedDate}</p>

                      {/* Venue with Icon */}
                      {event.location && (
                        <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
                          <MapPin size={12} className="shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
