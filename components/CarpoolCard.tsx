"use client";

import { useMemo, useState } from "react";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export type CarpoolRequest = {
  id: string;
  passenger_id: string;
  status: string;
  passenger: { full_name: string | null } | null;
};

export type Carpool = {
  id: string;
  event_id: string;
  driver_id: string;
  pickup_location: string;
  available_seats: number;
  departure_time: string | null;
  notes: string | null;
  driver: {
    full_name: string | null;
    avatar_url: string | null;
    rating_avg: number;
    rating_count?: number;
  } | null;
  carpool_requests: CarpoolRequest[];
};

type Props = {
  carpool: Carpool;
  currentUserId: string | null;
  onRefresh: () => void;
};

function formatDepartureTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function CarpoolCard({ carpool, currentUserId, onRefresh }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const isDriver = currentUserId === carpool.driver_id;
  const myRequest = carpool.carpool_requests.find(
    (r) => r.passenger_id === currentUserId
  );
  const acceptedRiders = carpool.carpool_requests.filter(
    (r) => r.status === "accepted"
  );
  const isFull = carpool.available_seats === 0;
  const driverName = carpool.driver?.full_name ?? "Driver";
  const driverRating = carpool.driver?.rating_avg ?? 0;
  const driverRatingCount = carpool.driver?.rating_count ?? 0;

  // Has the current user ridden with this driver in this carpool?
  const hasRidden =
    !isDriver &&
    myRequest?.status === "accepted";

  const join = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("carpool_requests").insert({
        carpool_id: carpool.id,
        passenger_id: currentUserId,
        status: "accepted",
      });
      if (error) return;
      await supabase
        .from("carpools")
        .update({ available_seats: carpool.available_seats - 1 })
        .eq("id", carpool.id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const leave = async () => {
    if (!myRequest) return;
    setLoading(true);
    try {
      await supabase
        .from("carpool_requests")
        .delete()
        .eq("id", myRequest.id);
      await supabase
        .from("carpools")
        .update({ available_seats: carpool.available_seats + 1 })
        .eq("id", carpool.id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const cancelOffer = async () => {
    setLoading(true);
    try {
      await supabase.from("carpools").delete().eq("id", carpool.id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const removeRider = async (request: CarpoolRequest) => {
    setLoading(true);
    try {
      await supabase.from("carpool_requests").delete().eq("id", request.id);
      await supabase
        .from("carpools")
        .update({ available_seats: carpool.available_seats + 1 })
        .eq("id", carpool.id);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const formattedTime = formatDepartureTime(carpool.departure_time);

  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden transition ${
        myRequest?.status === "accepted"
          ? "border-emerald-300 ring-1 ring-emerald-100"
          : "border-slate-200"
      }`}
    >
      {/* Driver row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        {/* Clickable driver avatar + name → profile page */}
        <a
          href={`/profile/${carpool.driver_id}`}
          className="flex items-center gap-3 flex-1 min-w-0 group"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
            {carpool.driver?.avatar_url ? (
              <img
                src={carpool.driver.avatar_url}
                alt={driverName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-emerald-700">
                {initials(driverName)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700 transition-colors">
              {driverName}
            </p>
            {driverRating > 0 ? (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                <span className="text-[11px] text-slate-500">
                  {driverRating.toFixed(1)}
                </span>
                {driverRatingCount > 0 && (
                  <span className="text-[11px] text-slate-400">
                    ({driverRatingCount})
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-0.5">No ratings yet</p>
            )}
          </div>
        </a>

        {/* Seats badge */}
        <div
          className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isFull
              ? "bg-slate-100 text-slate-500"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          <Users className="h-3 w-3" />
          {isFull ? "Full" : `${carpool.available_seats} left`}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
            <span className="leading-snug">{carpool.pickup_location}</span>
          </div>
          {formattedTime && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span>Leaving {formattedTime}</span>
            </div>
          )}
        </div>

        {carpool.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 leading-relaxed">
            {carpool.notes}
          </p>
        )}

        {acceptedRiders.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {acceptedRiders.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-1 pr-2 py-0.5"
              >
                <div className="w-4 h-4 rounded-full bg-slate-300 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-slate-600">
                    {initials(r.passenger?.full_name)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-600">
                  {r.passenger?.full_name ?? "Rider"}
                </span>
                {isDriver && (
                  <button
                    type="button"
                    onClick={() => removeRider(r)}
                    disabled={loading}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-red-100 hover:text-red-500 transition text-[10px] leading-none disabled:opacity-50"
                    title="Remove rider"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 flex-wrap">
          {isDriver && (
            <button
              onClick={cancelOffer}
              disabled={loading}
              className="text-xs font-semibold text-red-400 hover:text-red-600 disabled:opacity-50 transition"
            >
              Cancel offer
            </button>
          )}

          {!isDriver && myRequest?.status === "accepted" && (
            <>
              <button
                onClick={leave}
                disabled={loading}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-50 transition"
              >
                Leave carpool
              </button>
              <span className="text-[11px] text-emerald-600 font-semibold">
                You're in this ride
              </span>
            </>
          )}

          {!isDriver && !myRequest && (
            <button
              onClick={join}
              disabled={loading || isFull || !currentUserId}
              title={
                !currentUserId
                  ? "Sign in to join"
                  : isFull
                  ? "No seats left"
                  : undefined
              }
              className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {loading ? "Joining..." : "Request to join"}
            </button>
          )}

          {/* Rate driver button — only shows if you've ridden with them */}
          {hasRidden && (
            <a
              href={`/profile/${carpool.driver_id}`}
              className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-500 hover:text-amber-600 transition"
            >
              <Star className="h-3 w-3 fill-amber-400" />
              Rate driver
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
