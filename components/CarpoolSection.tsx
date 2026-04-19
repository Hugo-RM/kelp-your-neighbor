"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import CarpoolCard, { type Carpool } from "./CarpoolCard";
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

type Props = {
  eventId: string;
  eventLat: number;
  eventLng: number;
  currentUserId: string | null;
  currentUserDisplayName: string;
};

export default function CarpoolSection({
  eventId,
  eventLat,
  eventLng,
  currentUserId,
  currentUserDisplayName,
}: Props) {
  const supabase = useMemo(() => createClient(), []);
  const [carpools, setCarpools] = useState<Carpool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCarpools = useCallback(async () => {
    const { data } = await supabase
      .from("carpools")
      .select("*, carpool_riders(*)")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    setCarpools((data as Carpool[]) ?? []);
    setLoading(false);
  }, [supabase, eventId]);

  useEffect(() => {
    void fetchCarpools();
  }, [fetchCarpools]);

  const userIsHost = carpools.some((c) => c.host_user_id === currentUserId);

  const kgSaved = carpools.reduce((sum, c) => {
    const dist = haversineKm(eventLat, eventLng, c.pickup_lat, c.pickup_lng);
    const riders = c.seats_total - c.seats_available;
    return sum + dist * 0.21 * riders;
  }, 0);

  const handleFormSuccess = () => {
    setShowForm(false);
    void fetchCarpools();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* CO₂ badge */}
      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700 font-medium w-fit">
        {kgSaved > 0
          ? `${kgSaved.toFixed(1)} kg CO₂ saved by carpoolers`
          : "0 kg CO₂ saved — be the first to carpool!"}
      </div>

      {/* Carpools section */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
        <h3 className="font-semibold text-slate-800">Carpools</h3>

        {loading ? (
          <p className="text-sm text-slate-400">Loading carpools…</p>
        ) : carpools.length === 0 && !showForm ? (
          <p className="text-sm text-slate-400">
            No carpools yet. Be the first to offer a ride!
          </p>
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

        {showForm && currentUserId ? (
          <CarpoolHostForm
            eventId={eventId}
            userId={currentUserId}
            userDisplayName={currentUserDisplayName}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        ) : !currentUserId ? (
          <p className="text-xs text-slate-400">
            <a href="/auth" className="underline hover:text-slate-600">
              Sign in
            </a>{" "}
            to offer or join a ride.
          </p>
        ) : !userIsHost ? (
          <button
            onClick={() => setShowForm(true)}
            className="mt-1 rounded-full border border-emerald-300 bg-white px-4 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition w-fit"
          >
            Offer a ride
          </button>
        ) : null}
      </div>
    </div>
  );
}
