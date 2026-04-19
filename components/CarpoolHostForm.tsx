"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { FlareMapClientProps } from "@/app/events/create/flare-map-client";

interface LocationState {
  lat: number;
  lng: number;
}

interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    street?: string;
  };
  geometry: { coordinates: [number, number] };
}

const DEFAULT_LOCATION: LocationState = { lat: 36.6548, lng: -121.802 };

const PickupMap = dynamic<FlareMapClientProps>(
  () => import("@/app/events/create/flare-map-client").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[240px] items-center justify-center rounded-xl border border-slate-100 bg-white text-sm text-slate-400">
        Loading map...
      </div>
    ),
  }
);

type Props = {
  eventId: string;
  userId: string;
  userDisplayName: string;
  onSuccess: () => void;
  onCancel: () => void;
};

export default function CarpoolHostForm({
  eventId,
  userId,
  userDisplayName,
  onSuccess,
  onCancel,
}: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const [pickupAddress, setPickupAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [seats, setSeats] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Photon autocomplete
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          lat: String(DEFAULT_LOCATION.lat),
          lon: String(DEFAULT_LOCATION.lng),
          limit: "5",
        });
        const res = await fetch(
          `https://photon.komoot.io/api/?${params.toString()}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { features?: PhotonFeature[] };
        setSuggestions(
          (data.features ?? []).map((f, i) => {
            const [lng, lat] = f.geometry.coordinates;
            const name =
              f.properties.name ?? f.properties.street ?? "Unnamed place";
            const city =
              f.properties.city ??
              f.properties.town ??
              f.properties.village ??
              f.properties.county ??
              f.properties.state ??
              "Monterey";
            return { id: `${name}-${city}-${lng}-${lat}-${i}`, name, city, lat, lng };
          })
        );
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
  }, [searchQuery]);

  // Nominatim reverse geocode for address display
  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          lat: String(location.lat),
          lon: String(location.lng),
          format: "json",
          zoom: "18",
          addressdetails: "1",
        });
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${params.toString()}`
        );
        if (!res.ok) return;
        const result = (await res.json()) as { display_name?: string };
        if (!cancelled)
          setPickupAddress(result.display_name ?? "Unknown address");
      } catch {
        if (!cancelled) setPickupAddress("Address unavailable");
      }
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [location.lat, location.lng]);

  const selectSuggestion = (s: LocationSuggestion) => {
    setLocation({ lat: s.lat, lng: s.lng });
    setSearchQuery(`${s.name}, ${s.city}`);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupAddress) {
      setError("Pick a pickup location on the map.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase.from("carpools").insert({
        event_id: eventId,
        host_user_id: userId,
        host_display_name: userDisplayName,
        pickup_lat: location.lat,
        pickup_lng: location.lng,
        pickup_address: pickupAddress,
        seats_total: seats,
        seats_available: seats,
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
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 flex flex-col gap-3"
    >
      <p className="text-sm font-semibold text-slate-800">Offer a ride</p>

      {/* Location search */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Search pickup location…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
          />
          {searching && (
            <span className="text-xs text-slate-400">Searching…</span>
          )}
        </div>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-slate-50 transition"
                >
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {s.name}
                    <span className="text-slate-400">, {s.city}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-slate-200">
        <PickupMap location={location} onLocationChange={setLocation} />
      </div>

      {pickupAddress && (
        <p className="text-xs text-slate-500 flex gap-1 items-start">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          {pickupAddress}
        </p>
      )}

      {/* Seats */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-700 font-medium shrink-0">
          Seats available
        </label>
        <input
          type="number"
          min={1}
          max={7}
          value={seats}
          onChange={(e) => setSeats(Math.min(7, Math.max(1, Number(e.target.value))))}
          className="w-16 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-center text-slate-800 outline-none focus:ring-2 focus:ring-emerald-300"
        />
      </div>

      {/* Notes */}
      <textarea
        placeholder="Notes (optional) — e.g. Leaving at 6 PM from the Trader Joe's lot"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          {submitting ? "Offering…" : "Offer ride"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
