"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Car } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import CarpoolCard, { type Carpool, type CarpoolRequest } from "./CarpoolCard";
import CarpoolHostForm from "./CarpoolHostForm";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Rough center of Monterey Bay for CO2 distance calc fallback
const BAY_CENTER = { lat: 36.6002, lng: -121.8947 };

type Props = {
  eventId: string;
  eventLat: number;
  eventLng: number;
  currentUserId: string | null;
};

export default function CarpoolSection({
  eventId,
  eventLat,
  eventLng,
  currentUserId,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [carpools, setCarpools] = useState<Carpool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const eLat = isFinite(eventLat) ? eventLat : BAY_CENTER.lat;
  const eLng = isFinite(eventLng) ? eventLng : BAY_CENTER.lng;

  const fetchCarpools = useCallback(async () => {
    const { data: carpoolRows, error } = await supabase
      .from("carpools")
      .select("*, carpool_requests(*)")
      .eq("event_id", eventId)
      .order("departure_time", { ascending: true });

    if (error || !carpoolRows) {
      console.error("[CarpoolSection] fetch error:", error?.message);
      setLoading(false);
      return;
    }

    // Collect all user ids that need a profile lookup
    const userIds = [
      ...new Set([
        ...carpoolRows.map((c) => c.driver_id),
        ...carpoolRows.flatMap((c) =>
          (c.carpool_requests as { passenger_id: string }[]).map((r) => r.passenger_id)
        ),
      ]),
    ];

    const { data: profileRows } = userIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, rating_avg")
          .in("id", userIds)
      : { data: [] };

    const profileMap = Object.fromEntries(
      (profileRows ?? []).map((p) => [p.id, p])
    );

    const merged: Carpool[] = carpoolRows.map((c) => ({
      ...c,
      driver: profileMap[c.driver_id] ?? null,
      carpool_requests: (c.carpool_requests as CarpoolRequest[]).map((r) => ({
        ...r,
        passenger: profileMap[r.passenger_id] ? { full_name: profileMap[r.passenger_id].full_name } : null,
      })),
    }));

    setCarpools(merged);
    setLoading(false);
  }, [supabase, eventId]);

  useEffect(() => {
    void fetchCarpools();
  }, [fetchCarpools]);

  const userIsDriver = carpools.some((c) => c.driver_id === currentUserId);
  const userIsRider = carpools.some((c) =>
    c.carpool_requests.some(
      (r) => r.passenger_id === currentUserId && r.status === "accepted"
    )
  );

  const kgSaved = carpools.reduce((sum, c) => {
    // Use lat/lng from first accepted rider's location — not available, so use
    // a fixed estimate: avg 15km round trip × 0.21 kg/km × riders
    const riders = c.carpool_requests.filter((r) => r.status === "accepted").length;
    const dist = haversineKm(eLat, eLng, eLat + 0.05, eLng + 0.05); // placeholder; real pickup coords not stored
    return sum + dist * 0.21 * riders;
  }, 0);

  const handleFormSuccess = () => {
    setShowForm(false);
    void fetchCarpools();
  };

  const canOfferRide = currentUserId && !userIsDriver && !showForm;

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-4 w-4 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Rides</h3>
          {carpools.length > 0 && (
            <span className="text-xs text-slate-400">{carpools.length} offered</span>
          )}
        </div>
        {kgSaved > 0.01 && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            {kgSaved.toFixed(1)} kg CO2 saved
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : carpools.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-6 flex flex-col items-center gap-3 text-center">
          <Car className="h-7 w-7 text-slate-300" />
          <div>
            <p className="text-sm font-medium text-slate-600">No rides offered yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Be the first to offer a ride to this event
            </p>
          </div>
          {currentUserId ? (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
            >
              Offer a ride
            </button>
          ) : (
            <a
              href="/auth"
              className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2 transition"
            >
              Sign in to offer or join a ride
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {carpools.map((c) => (
            <CarpoolCard
              key={c.id}
              carpool={c}
              currentUserId={currentUserId}
              onRefresh={fetchCarpools}
            />
          ))}
        </div>
      )}

      {/* Inline offer form */}
      {showForm && currentUserId && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-800">Offer a ride</p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 transition text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <CarpoolHostForm
            eventId={eventId}
            userId={currentUserId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {canOfferRide && carpools.length > 0 && !userIsRider && (
        <button
          onClick={() => setShowForm(true)}
          className="self-start text-xs font-semibold text-slate-500 hover:text-emerald-700 underline underline-offset-2 transition"
        >
          Also driving? Offer a ride
        </button>
      )}

      {!currentUserId && carpools.length > 0 && (
        <a
          href="/auth"
          className="self-start text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 transition"
        >
          Sign in to join a ride
        </a>
      )}
    </div>
  );
}
