import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

interface TicketmasterEvent {
    id: string
    name: string
    description?: string
    dates: {
        start: {
            dateTime: string
            localDate: string
        }
    }
    images?: Array<{ url: string }>
    _embedded?: {
        venues?: Array<{
            name: string
            location?: {
                latitude: number
                longitude: number
            }
            address?: {
                line1?: string
            }
            city?: {
                name: string
            }
        }>
    }
}

export async function POST(request: NextRequest) {
    // Security: Check for CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    console.log("Authorization header received:", authHeader)
    console.log("CRON_SECRET env var:", cronSecret ? '***set***' : 'NOT SET')
    console.log("Expected header:", `Bearer ${cronSecret}`)

    if (!cronSecret) {
        return NextResponse.json(
            { error: 'CRON_SECRET not configured on server' },
            { status: 500 }
        )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: `Unauthorized. Got: "${authHeader}"` },
            { status: 401 }
        )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const ticketmasterKey = process.env.TICKETMASTER_API_KEY

    if (!supabaseUrl || !supabaseKey || !ticketmasterKey) {
        return NextResponse.json(
            { error: 'Missing environment variables' },
            { status: 500 }
        )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Fetch events from Ticketmaster for Monterey County area
        const ticketmasterUrl = new URL(
            'https://app.ticketmaster.com/discovery/v2/events'
        )
        ticketmasterUrl.searchParams.append('postalCode', '93940')
        ticketmasterUrl.searchParams.append('radius', '25')
        ticketmasterUrl.searchParams.append('unit', 'miles')
        ticketmasterUrl.searchParams.append('size', '50')
        ticketmasterUrl.searchParams.append('sort', 'date,asc')
        ticketmasterUrl.searchParams.append('apikey', ticketmasterKey)

        const response = await fetch(ticketmasterUrl.toString())
        if (!response.ok) {
            return NextResponse.json(
                { error: `Ticketmaster API error: ${response.status}` },
                { status: response.status }
            )
        }

        const data = (await response.json()) as {
            _embedded?: { events?: TicketmasterEvent[] }
        }
        const events = data._embedded?.events ?? []

        // Fetch existing external_ids to avoid duplicates
        const { data: existingEvents } = await supabase
            .from('events')
            .select('external_id')
            .eq('source', 'ticketmaster')

        const existingExternalIds = new Set(existingEvents?.map(e => e.external_id) || [])

        const VENUE_COORDINATES: Record<string, { lat: number, lng: number }> = {
            "Golden State Theatre": { lat: 36.5994, lng: -121.8939 },
            "Monterey County Fairgrounds": { lat: 36.5952, lng: -121.8650 },
            "Sunset Center": { lat: 36.5534, lng: -121.9208 },
        };

        // Map Ticketmaster data to our schema and prepare for upsert
        const eventsToUpsert = events
            .filter((event) => event.dates?.start?.dateTime)
            .filter((event) => !existingExternalIds.has(event.id)) // Only new events
            .map((event) => {
                
                const venue = event._embedded?.venues?.[0]
                const startTime = new Date(event.dates.start.dateTime)
                const eventDate = event.dates.start.localDate
                
                // Use mapped venue coordinates if available, otherwise use Ticketmaster's
                let coordinates = venue?.location
                if (venue?.name && VENUE_COORDINATES[venue.name]) {
                    const mapped = VENUE_COORDINATES[venue.name]
                    coordinates = { latitude: mapped.lat, longitude: mapped.lng }
                    console.log(`Using mapped coordinates for ${venue.name}`)
                }

                // Use event description for overview, fallback to venue info
                const overview =
                    event.description ||
                    `${venue?.name || 'Ticketmaster Event'} - ${venue?.city?.name || 'Monterey County'}`

                console.log(`Event: ${event.name}, Coordinates:`, coordinates)
                console.log(`Event: ${event.name} | Venue: ${venue?.name} | Lat: ${coordinates?.latitude} | Lon: ${coordinates?.longitude}`);
                return {
                    external_id: event.id,
                    source: 'ticketmaster',
                    title: event.name,
                    overview,
                    event_date: eventDate,
                    start_time: startTime.toISOString(),
                    venue_name: venue?.name || 'Ticketmaster Venue',
                    image_url: event.images?.[0]?.url || null,
                    location: coordinates
                        ? `POINT(${coordinates.longitude} ${coordinates.latitude})`
                        : null,
                    creator_id: '67dbd586-14c5-4311-9c7c-7bf7c6e6fdb4', // Test user
                    tags: ['#Event', '#Concert'],
                }
            })
            .filter((event) => event.location) // Only include events with valid coordinates

        if (eventsToUpsert.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No valid events found to sync',
                synced: 0,
            })
        }

        // Insert only new events
        const { data: upsertedData, error } = await supabase
            .from('events')
            .insert(eventsToUpsert)

        if (error) {
            console.error('Supabase upsert error:', error)
            return NextResponse.json(
                { error: `Failed to sync events: ${error.message}` },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            synced: eventsToUpsert.length,
            message: `Successfully synced ${eventsToUpsert.length} Ticketmaster events`,
            data: upsertedData,
        })
    } catch (error) {
        console.error('Ticketmaster sync error:', error)
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            },
            { status: 500 }
        )
    }
}
