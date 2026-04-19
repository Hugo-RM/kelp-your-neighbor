export type Event = {
  id: string;
  title: string;
  type: string;
  date: string; // ISO date string e.g. "2025-10-05"
  lat: number;
  lng: number;
  location: string;
  createdBy: string;
  overview?: string;
  picture?: string | null;
  attendees?: string[];
};

// TODO: remove once Supabase events table is live and getEvents() is swapped
export const MOCK_EVENTS: Event[] = [
  {
<<<<<<< HEAD
    id: "1",
=======
    id: "mock-1",
>>>>>>> db-to-map
    title: "Example Event",
    type: "Music",
    date: "2025-09-19",
    lat: 36.6002,
    lng: -121.8947,
    location: "Monterey Bay",
    createdBy: "Placeholder",
    overview: "This is a placeholder event. Real events will load from the database.",
    attendees: [],
  },
];
