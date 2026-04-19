"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export type CarpoolRider = {
  id: string;
  rider_user_id: string;
  rider_display_name: string;
};

export type Carpool = {
  id: string;
  event_id: string;
  host_user_id: string;
  host_display_name: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  seats_total: number;
  seats_available: number;
  notes: string | null;
  created_at: string;
  carpool_riders: CarpoolRider[];
};

type Props = {
  carpool: Carpool;
  currentUserId: string | null;
  onRefresh: () => void;
};

export default function CarpoolCard({ carpool, currentUserId, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const isHost = currentUserId === carpool.host_user_id;
  const isRider = carpool.carpool_riders.some((r) => r.rider_user_id === currentUserId);
  const isFull = carpool.seats_available === 0;

  const join = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("carpool_riders").insert({
        carpool_id: carpool.id,
        rider_user_id: user.id,
        rider_display_name:
          (user.user_metadata?.full_name as string | undefined) ??
          user.email ??
          "Anonymous",
      });
      if (error) return;

      await supabase
        .from("carpools")
        .update({ seats_available: carpool.seats_available - 1 })
        .eq("id", carpool.id);

      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const cancelRide = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      await supabase
        .from("carpool_riders")
        .delete()
        .eq("carpool_id", carpool.id)
        .eq("rider_user_id", currentUserId);

      await supabase
        .from("carpools")
        .update({ seats_available: carpool.seats_available + 1 })
        .eq("id", carpool.id);

      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const cancelOffer = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      // ON DELETE CASCADE removes carpool_riders rows automatically
      await supabase.from("carpools").delete().eq("id", carpool.id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {carpool.host_display_name}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{carpool.pickup_address}</p>
        </div>
        {isFull ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            Full
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {carpool.seats_available}/{carpool.seats_total} seats
          </span>
        )}
      </div>

      {carpool.notes && (
        <p className="text-xs text-slate-500 italic">{carpool.notes}</p>
      )}

      {carpool.carpool_riders.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {carpool.carpool_riders.map((r) => (
            <span
              key={r.id}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
            >
              {r.rider_display_name}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        {isHost && (
          <button
            onClick={cancelOffer}
            disabled={loading}
            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-50 transition"
          >
            Cancel offer
          </button>
        )}
        {!isHost && isRider && (
          <button
            onClick={cancelRide}
            disabled={loading}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel ride
          </button>
        )}
        {!isHost && !isRider && (
          <button
            onClick={join}
            disabled={loading || isFull || !currentUserId}
            title={!currentUserId ? "Sign in to join a carpool" : undefined}
            className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}
