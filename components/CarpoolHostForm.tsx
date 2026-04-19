"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, Users, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface LocationSuggestion {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
  };
  geometry: { coordinates: [number, number] };
}

const DEFAULT_BIAS = { lat: 36.6548, lng: -121.802 };

type Props = {
  eventId: string;
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function CarpoolHostForm({
  eventId,
  userId,
  onSuccess,
  onCancel,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<LocationSuggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [seats, setSeats] = useState(3);
  const [departureTime, setDepartureTime] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q || selected) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q,
          lat: String(DEFAULT_BIAS.lat),
          lon: String(DEFAULT_BIAS.lng),
          limit: "6",
        });
        const res = await fetch(`https://photon.komoot.io/api/?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { features?: PhotonFeature[] };

        setSuggestions(
          (data.features ?? []).map((f, i) => {
            const [lng, lat] = f.geometry.coordinates;
            const p = f.properties;
            const name =
              [p.housenumber, p.street].filter(Boolean).join(" ") ||
              p.name ||
              "Unnamed place";
            const city =
              p.city ?? p.town ?? p.village ?? p.county ?? p.state ?? "";
            return {
              id: `${name}-${city}-${lng}-${lat}-${i}`,
              label: city ? `${name}, ${city}` : name,
              lat,
              lng,
            };
          })
        );
        setShowDropdown(true);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, selected]);

  const pick = (s: LocationSuggestion) => {
    setSelected(s);
    setQuery(s.label);
    setSuggestions([]);
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelected(null);
    setQuery("");
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selected) {
      setError("Choose a pickup location from the search results.");
      return;
    }
    if (!departureTime) {
      setError("Add a departure time so riders know when to be ready.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("carpools").insert({
        event_id: eventId,
        driver_id: userId,
        pickup_location: selected.label,
        available_seats: seats,
        departure_time: new Date(departureTime).toISOString(),
        notes: notes.trim() || null,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
      {/* Pickup location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Pickup location
        </label>
        <div className="relative">
          <div
            className={`flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 transition ${
              showDropdown && suggestions.length > 0
                ? "border-emerald-400 ring-2 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            {selected ? (
              <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => {
                if (selected) clearSelection();
                setQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Search your pickup spot..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
            />
            {searching && (
              <span className="text-[11px] text-slate-400 shrink-0">Searching...</span>
            )}
            {selected && (
              <button
                type="button"
                onClick={clearSelection}
                className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition text-xs leading-none"
              >
                &times;
              </button>
            )}
          </div>

          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={() => pick(s)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition border-b border-slate-50 last:border-0"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="text-sm text-slate-700 leading-snug">{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Departure time + Seats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Departing at
          </label>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
            <Clock className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="flex-1 text-sm text-slate-800 outline-none bg-transparent"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Seats available
          </label>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition text-base font-medium leading-none"
            >
              -
            </button>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-sm font-semibold text-slate-800 w-4 text-center tabular-nums">
                {seats}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(7, s + 1))}
              className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition text-base font-medium leading-none"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Notes{" "}
          <span className="normal-case font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Meet at the north entrance of Trader Joe's"
          rows={2}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {submitting ? "Posting..." : "Post ride"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
