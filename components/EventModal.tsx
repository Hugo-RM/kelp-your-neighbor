"use client";

import { useEffect, useMemo, useState } from "react";
import { Event } from "@/lib/mock-events";
import { TYPE_COLORS } from "@/lib/event-colors";
import { createClient } from "@/utils/supabase/client";
import CarpoolSection from "./CarpoolSection";

type Props = {
  event: Event | null;
  onClose: () => void;
};

export default function EventModal({ event, onClose }: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserDisplayName(
          (user.user_metadata?.full_name as string | undefined) ??
            user.email ??
            "Anonymous"
        );
      } else {
        setCurrentUserId(null);
        setCurrentUserDisplayName("");
      }
    });
  }, [supabase]);

  if (!event) return null;

  const color = TYPE_COLORS[event.type] ?? TYPE_COLORS["default"];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo placeholder */}
        <div
          className="h-44 w-full rounded-t-2xl flex items-center justify-center"
          style={{ backgroundColor: color + "22" }}
        >
          {event.picture ? (
            <img src={event.picture} alt={event.title} className="h-full w-full object-cover rounded-t-2xl" />
          ) : (
            <span className="text-5xl opacity-30 font-mono text-slate-300">?</span>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-white/80 p-1.5 text-slate-400 hover:text-slate-700 transition shadow-sm"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 flex flex-col gap-4">
          {/* Title + category badge */}
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900 leading-snug">{event.title}</h2>
            <span
              className="shrink-0 mt-0.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {event.type}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1 text-sm text-slate-500">
            <span>{new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span>{event.location}</span>
            <span>Created by {event.createdBy}</span>
          </div>

          {/* Overview */}
          {event.overview && (
            <p className="text-sm text-slate-700 leading-relaxed">{event.overview}</p>
          )}

          {/* Attendees */}
          <div>
            <h3 className="font-semibold text-sm text-slate-800 mb-2">Attendees</h3>
            {event.attendees && event.attendees.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {event.attendees.map((name) => (
                  <span key={name} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-0.5 text-xs text-slate-600">{name}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No attendees yet. Be the first!</p>
            )}
          </div>

          {/* Carpool section */}
          <CarpoolSection
            eventId={event.id}
            eventLat={event.lat}
            eventLng={event.lng}
            currentUserId={currentUserId}
            currentUserDisplayName={currentUserDisplayName}
          />
        </div>
      </div>
    </div>
  );
}
