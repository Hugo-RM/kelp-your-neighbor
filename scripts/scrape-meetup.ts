import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

interface MeetupEvent {
  title: string;
  dateTime: string;
  description?: string;
  venue?: {
    name: string;
    lat: number;
    lng: number;
  };
}

interface Coordinates {
  lat: number;
  lng: number;
}

// Monterey, CA coordinates
const MONTEREY_LAT = 36.6002;
const MONTEREY_LNG = -121.8863;
const SEARCH_RADIUS_MILES = 25;

// Initialize Supabase client with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceUserId = process.env.SERVICE_USER_ID || '67dbd586-14c5-4311-9c7c-7bf7c6e6fdb4';
const meetupApiKey = process.env.MEETUP_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!meetupApiKey) {
  throw new Error('Missing MEETUP_API_KEY environment variable');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Generate unique external_id by hashing title + dateTime
function generateExternalId(title: string, dateTime: string): string {
  const hash = createHash('sha256')
    .update(`${title}${dateTime}`)
    .digest('hex');
  return hash.substring(0, 16); // Use first 16 chars of hash
}

// Convert miles to kilometers (Meetup API uses km)
function milesToKm(miles: number): number {
  return miles * 1.60934;
}

// Fetch events from Meetup GraphQL API
async function fetchMeetupEvents(): Promise<MeetupEvent[]> {
  const radiusKm = milesToKm(SEARCH_RADIUS_MILES);

  const query = `
    query {
      eventSearch(input: {
        lat: ${MONTEREY_LAT}
        lon: ${MONTEREY_LNG}
        radius: ${radiusKm}
        first: 50
      }) {
        edges {
          node {
            id
            title
            dateTime
            description
            venue {
              name
              lat
              lng
            }
          }
        }
      }
    }
  `;

  try {
    console.log(`Searching for events within ${SEARCH_RADIUS_MILES} miles of Monterey, CA...`);

    const response = await fetch('https://api.meetup.com/gql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${meetupApiKey}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meetup API error ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
    }

    if (!result.data?.eventSearch?.edges) {
      console.warn('No events found in Meetup response');
      return [];
    }

    const events = result.data.eventSearch.edges
      .map((edge: any) => edge.node)
      .filter((event: any) => event.title && event.dateTime);

    console.log(`Found ${events.length} events from Meetup API`);
    return events;
  } catch (error) {
    console.error('Error fetching Meetup events:', error);
    throw error;
  }
}

// Map Meetup data to Supabase schema and upsert
async function upsertEvents(events: MeetupEvent[]): Promise<void> {
  for (const event of events) {
    try {
      if (!event.title || !event.dateTime) {
        console.warn('Skipping event with missing title or dateTime');
        continue;
      }

      // Parse ISO datetime
      const eventDate = new Date(event.dateTime);
      if (isNaN(eventDate.getTime())) {
        console.warn(`Skipping event with invalid dateTime: ${event.dateTime}`);
        continue;
      }

      // Format for Supabase: YYYY-MM-DD and ISO timestamp
      const eventDateStr = eventDate.toISOString().split('T')[0];
      const startTimeStr = eventDate.toISOString();

      // Use venue coordinates if available, otherwise use Monterey center
      let lat = MONTEREY_LAT;
      let lng = MONTEREY_LNG;
      let venueName: string | null = null;

      if (event.venue) {
        venueName = event.venue.name || null;
        if (event.venue.lat && event.venue.lng) {
          lat = event.venue.lat;
          lng = event.venue.lng;
        }
      }

      // Generate unique external_id
      const external_id = generateExternalId(event.title, event.dateTime);

      // Clean up description if present
      const description = event.description
        ? event.description.replace(/<[^>]*>/g, '').trim().substring(0, 1000) // Remove HTML, limit length
        : null;

      // Prepare data for Supabase
      const eventData = {
        title: event.title,
        event_date: eventDateStr,
        venue_name: venueName,
        start_time: startTimeStr,
        location: `POINT(${lng} ${lat})`, // PostGIS POINT format: POINT(longitude latitude)
        external_id,
        source: 'meetup',
        creator_id: serviceUserId,
        overview: description,
        tags: [],
        image_url: null,
      };

      // Upsert into events table
      const { data, error } = await supabase
        .from('events')
        .upsert([eventData], { onConflict: 'external_id' });

      if (error) {
        console.error(`Error upserting event "${event.title}":`, error);
      } else {
        console.log(
          `✓ Upserted: ${event.title} (${eventDateStr}) at ${venueName || 'Monterey'}`
        );
      }
    } catch (error) {
      console.error(`Error processing event "${event.title}":`, error);
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('Starting Meetup scraper...\n');
    const events = await fetchMeetupEvents();

    if (events.length > 0) {
      console.log(`\nUpserting ${events.length} events to Supabase...\n`);
      await upsertEvents(events);
      console.log('\n✓ Done!');
    } else {
      console.log('No events to upsert');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
