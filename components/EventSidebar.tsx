"use client";

import { Event } from "@/lib/mock-events";
import { MapPin } from "lucide-react";
import { useState } from "react";

type Props = {
  events: Event[];
  selectedEvent: Event | null;
  onEventClick: (event: Event) => void;
};

export default function EventSidebar({ events, selectedEvent, onEventClick }: Props) {
  const [isVisible] = useState(true);

  // Filter events to only show those after today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    return eventDate >= today;
  });

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .sidebar-enter {
          animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .sidebar-exit {
          animation: slideOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .header-enter {
          animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Only show when scrolled to map */}
      {isVisible && (
        <>
          {/* Absolute Floating Pop Sidebar */}
          <div
            className={`absolute right-5 top-12 h-[calc(100%-64px)] w-[32%] p-4 pointer-events-auto z-[9999] sidebar-enter flex flex-col`}
          >
            {/* Main Panel - Glassmorphism Pop Effect */}
            <div
              className="h-full flex flex-col bg-white/80 backdrop-blur-md shadow-2xl rounded-2xl border border-white/40"
              style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.5)",
              }}
            >
              {/* Header */}
              <div className="header-enter px-6 py-4 border-b border-slate-100/50 shrink-0 bg-gradient-to-r from-white/40 to-white/20">
                <h2 className="text-lg font-bold text-slate-900">Events</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} nearby
                </p>
              </div>

              {/* Scrollable Events Container */}
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredEvents.length === 0 ? (
                  <div className="flex items-center justify-center h-full px-4">
                    <p className="text-sm text-slate-400 text-center">
                      No events in this area. Try zooming in or moving the map.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 p-4">
                    {filteredEvents.map((event, index) => {
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
                          className={`group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out transform hover:translate-y-[-4px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            isSelected
                              ? "shadow-lg scale-[1.02] bg-white/60 border-2 border-emerald-400"
                              : "shadow-md hover:shadow-xl bg-white border border-slate-100/50 hover:border-slate-200"
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {/* Image Container */}
                          <div className="relative w-full h-40 overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                            {event.picture ? (
                              <img
                                src={event.picture}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-slate-300">
                                  <MapPin size={32} />
                                </div>
                              </div>
                            )}
                            
                            {/* Overlay Badge */}
                            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
                              <span className="text-xs font-semibold text-white">{event.type}</span>
                            </div>
                          </div>

                          {/* Content Container */}
                          <div className="flex flex-col gap-2 p-4">
                            {/* Title */}
                            <h3 className="font-bold text-sm text-slate-900 leading-tight line-clamp-2">
                              {event.title}
                            </h3>

                            {/* Overview */}
                            {event.overview && (
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                {event.overview}
                              </p>
                            )}

                            {/* Meta Information */}
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                              {/* Date */}
                              <p className="text-xs text-slate-500 font-medium">{formattedDate}</p>

                              {/* Venue with Icon */}
                              {event.location && (
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                                  <MapPin size={14} className="shrink-0 text-emerald-600" />
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
          </div>
        </>
      )}
    </>
  );
}
