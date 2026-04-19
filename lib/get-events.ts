import { createClient } from "@/utils/supabase/client";
import { Event } from "./mock-events";

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

type DbEvent = {
  id: string;
  title: string;
  overview: string | null;
  event_date: string;
  location: string;
  image_url: string | null;
  creator_id: string;
  tags: string[];
  venue_name: string | null;
};

// PostGIS EWKB → { lat, lng }
function parseWKBPoint(hex: string): { lat: number; lng: number } {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const view = new DataView(bytes.buffer);
  const le = bytes[0] === 1;
  const type = view.getUint32(1, le);
  const hasSrid = (type & 0x20000000) !== 0;
  const offset = hasSrid ? 9 : 5;
  return {
    lng: view.getFloat64(offset, le),
    lat: view.getFloat64(offset + 8, le),
  };
}

function mapDbEvent(row: DbEvent): Event {
  const { lat, lng } = parseWKBPoint(row.location);
  // tags look like ["#Event","#Concert"] — use the second tag as the display type
  const type = (row.tags[1] ?? row.tags[0] ?? "#Event").replace("#", "");
  return {
    id: row.id,
    title: row.title,
    type,
    date: row.event_date,
    lat,
    lng,
    location: row.venue_name ?? "",
    createdBy: row.creator_id,
    overview: row.overview ?? undefined,
    picture: row.image_url,
    attendees: [],
  };
}

export async function getEvents(filter: EventFilter): Promise<Event[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, overview, event_date, location, image_url, creator_id, tags, venue_name");

  if (error) throw error;

  let events = (data as DbEvent[]).map(mapDbEvent);

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
      (e) => e.lat >= swLat && e.lat <= neLat && e.lng >= swLng && e.lng <= neLng
    );
  }

  return events;
}
