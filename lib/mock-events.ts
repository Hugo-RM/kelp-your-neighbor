export type Event = {
  id: number;
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

export const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: "Monterey Jazz Fest",
    type: "Music",
    date: "2025-09-19",
    lat: 36.6002,
    lng: -121.8947,
    location: "Monterey Fairgrounds",
    createdBy: "Festival Committee",
    overview: "One of the world's longest-running jazz festivals.",
    attendees: ["Alice", "Bob", "Carlos"],
  },
  {
    id: 2,
    title: "Pacific Grove Butterfly Parade",
    type: "Community Event",
    date: "2025-10-05",
    lat: 36.6177,
    lng: -121.9166,
    location: "Pacific Grove",
    createdBy: "City of PG",
    overview: "Annual parade celebrating the monarch butterfly migration.",
    attendees: ["Diana", "Evan"],
  },
  {
    id: 3,
    title: "Cannery Row 5K",
    type: "Sports",
    date: "2025-11-12",
    lat: 36.6176,
    lng: -121.9018,
    location: "Cannery Row",
    createdBy: "Monterey Running Club",
    overview: "Scenic run along the historic waterfront.",
  },
  {
    id: 4,
    title: "CSUMB Food Truck Rally",
    type: "Food",
    date: "2025-09-28",
    lat: 36.6542,
    lng: -121.8008,
    location: "CSUMB Campus",
    createdBy: "CSUMB ASI",
    overview: "Local food trucks, live music, and community vibes.",
    attendees: ["Fiona"],
  },
  {
    id: 5,
    title: "Coffee & Classic Cars Meetup",
    type: "Coffee & Cars",
    date: "2025-09-21",
    lat: 36.6250,
    lng: -121.8850,
    location: "Fisherman's Wharf Parking Lot",
    createdBy: "Local Car Club",
  },
  {
    id: 6,
    title: "Retro Gaming Night",
    type: "Gaming",
    date: "2025-09-25",
    lat: 36.5886,
    lng: -121.8753,
    location: "The Arcade Room",
    createdBy: "Gaming Enthusiasts",
    overview: "Bring your high scores and competitive spirit!",
  },
];
