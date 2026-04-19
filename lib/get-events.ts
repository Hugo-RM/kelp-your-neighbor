import { MOCK_EVENTS, Event } from "./mock-events";

export type BoundsFilter = {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
};

export type EventFilter = {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  bounds?: BoundsFilter;
};

/**
 * STUB: returns mock data filtered client-side.
 *
 * TODO (Phase 2 — when Supabase events table exists):
 * Replace this function body with a Supabase query, e.g.:
 *
 *   const { data } = await supabase
 *     .from("events")
 *     .select("*")
 *     .gte("lat", filter.bounds?.swLat)
 *     .lte("lat", filter.bounds?.neLat)
 *     .gte("lng", filter.bounds?.swLng)
 *     .lte("lng", filter.bounds?.neLng)
 *     .eq("type", filter.type)
 *     ... etc
 *
 * The function signature and return type must stay the same.
 */
export async function getEvents(filter: EventFilter): Promise<Event[]> {
  let events = [...MOCK_EVENTS];

  if (filter.type && filter.type !== "all") {
    events = events.filter((e) => e.type.toLowerCase() === filter.type!.toLowerCase());
  }
  if (filter.dateFrom) {
    events = events.filter((e) => e.date >= filter.dateFrom!);
  }
  if (filter.dateTo) {
    events = events.filter((e) => e.date <= filter.dateTo!);
  }
  if (filter.bounds) {
    const { swLat, swLng, neLat, neLng } = filter.bounds;
    events = events.filter(
      (e) =>
        e.lat >= swLat && e.lat <= neLat &&
        e.lng >= swLng && e.lng <= neLng
    );
  }

  return events;
}
