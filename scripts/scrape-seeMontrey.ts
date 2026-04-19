import 'dotenv/config';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { getVenueCoordinates, MONTEREY_CENTER } from '../lib/venues';

interface ScrapedEvent {
  title: string;
  date: string;
  location_name: string;
  image: string;
  link: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

// Initialize Supabase client with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceUserId = process.env.SERVICE_USER_ID || '67dbd586-14c5-4311-9c7c-7bf7c6e6fdb4'; // Default placeholder
const defaultEventTime = '12:00:00'; // Default to noon

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Generate unique external_id by hashing title + date
function generateExternalId(title: string, date: string): string {
  const hash = createHash('sha256').update(`${title}${date}`).digest('hex');
  return hash.substring(0, 16); // Use first 16 chars of hash
}

// Track unknown venues for easy reference
const unknownVenues = new Set<string>();

// Get venue coordinates from hardcoded mapping
function getCoords(venueName: string): Coordinates | null {
  if (!venueName || venueName.length < 2) {
    return null;
  }

  const coords = getVenueCoordinates(venueName);
  if (coords) {
    return coords;
  }

  // Track unknown venues
  unknownVenues.add(venueName);
  return null;
}

// Scrape events from seemonterey.com
async function scrapeSeeMonterey(): Promise<ScrapedEvent[]> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Go to the events page
    await page.goto('https://www.seemonterey.com/events/', { waitUntil: 'networkidle' });

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    // Debug: Log page title
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // Look for event cards - they're usually in containers with specific structures
    const eventSelectors = [
      'div[class*="event-card"]',
      'div[class*="listing"]',
      'li[class*="event"]',
      '.flex.flex-col',  // Common grid layout pattern
      '[data-event-id]',
      'article[class*="event"]'
    ];

    let foundSelector = null;
    let eventCount = 0;

    for (const selector of eventSelectors) {
      const count = await page.locator(selector).count();
      console.log(`Found ${count} elements with selector: ${selector}`);
      if (count > 5) {  // Threshold to avoid single UI elements
        foundSelector = selector;
        eventCount = count;
        break;
      }
    }

    if (!foundSelector) {
      console.warn('Could not find event container elements');
      await page.screenshot({ path: 'debug-screenshot.png' });
      console.log('Screenshot saved to debug-screenshot.png');
      await browser.close();
      return [];
    }

    console.log(`Using selector: ${foundSelector} (found ${eventCount} elements)\n`);

    // Click "Load More" button up to 4 times to load more events
    console.log('⏳ Loading events by clicking "Load More" button...');
    let currentEventCount = eventCount;
    console.log(`  Initial events: ${currentEventCount}`);

    let loadMoreAttempts = 0;
    const maxAttempts = 4;

    while (loadMoreAttempts < maxAttempts) {
      // Look for "Load More" button - try various selectors
      const loadMoreSelectors = [
        'button:has-text("Load More")',
        'button:has-text("load more")',
        'button:has-text("See More")',
        'button:has-text("see more")',
        'a:has-text("Load More")',
        'a:has-text("load more")',
        '[class*="load-more"]',
        '[class*="see-more"]',
        'button[class*="more"]',
        'a[class*="more"]'
      ];

      let foundButton = null;
      for (const selector of loadMoreSelectors) {
        const button = page.locator(selector).first();
        if (await button.count() > 0) {
          foundButton = button;
          break;
        }
      }

      if (!foundButton) {
        console.log('✓ No more "Load More" button found');
        break;
      }

      // Scroll button into view and click it
      await foundButton.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await foundButton.click();
      console.log(`  Clicked "Load More" button (attempt ${loadMoreAttempts + 1})`);

      // Wait for new content to load
      await page.waitForTimeout(2000);

      // Check new event count
      const newEventCount = await page.locator(foundSelector).count();
      console.log(`  Events after click: ${newEventCount}`);

      if (newEventCount === currentEventCount) {
        console.log('✓ No new events loaded');
        break;
      }

      currentEventCount = newEventCount;
      loadMoreAttempts++;
    }

    console.log(`\n✓ Finished loading. Total events visible: ${currentEventCount}\n`);

    // Extract all text content first to understand structure
    const events = await page.evaluate((selector) => {
      const items = Array.from(document.querySelectorAll(selector));
      return items.map((item) => {
        // Get all text content
        const allText = item.textContent || '';
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l);
        
        // Try to extract structured data
        const titleEl = item.querySelector('h2, h3, h4, [class*="title"]');
        const dateEl = item.querySelector('[class*="date"], time, [class*="time"]');
        const locationEl = item.querySelector('[class*="location"], [class*="venue"], [class*="address"]');
        const imgEl = item.querySelector('img');
        const linkEl = item.querySelector('a');

        // Extract location from text if structured element not found
        let location = locationEl?.textContent?.trim() || '';
        if (!location && lines.length > 2) {
          // Location might be in the text content, usually after title and date
          location = lines.find(l => 
            !l.match(/^\d+\/\d+/) && // Not a date
            !l.match(/^\d+:\d+/) && // Not a time
            l.length > 5 &&
            l.length < 80
          ) || '';
        }

        return {
          title: titleEl?.textContent?.trim() || lines[0] || '',
          date: dateEl?.textContent?.trim() || (lines.find(l => l.match(/^\d+\/\d+/)) || ''),
          location_name: location,
          image: imgEl?.src || imgEl?.getAttribute('data-src') || '',
          link: linkEl?.href || '',
          rawText: allText.substring(0, 200)  // Debug: first 200 chars
        };
      });
    }, foundSelector);

    console.log(`Extracted ${events.length} potential events`);
    
    // Filter out non-events (like navigation elements)
    const realEvents = events.filter(e => {
      const hasBasicInfo = e.title && e.title.length > 3;
      const notNavigation = !e.title.toLowerCase().includes('skip') && 
                           !e.title.toLowerCase().includes('menu') &&
                           !e.title.toLowerCase().includes('search');
      return hasBasicInfo && notNavigation;
    });

    console.log(`After filtering: ${realEvents.length} real events`);
    
    if (realEvents.length > 0) {
      console.log('\nFirst 3 events:');
      realEvents.slice(0, 3).forEach((e, i) => {
        console.log(`\nEvent ${i + 1}:`);
        console.log(`  Title: ${e.title.substring(0, 60)}`);
        console.log(`  Date: ${e.date.substring(0, 60)}`);
        console.log(`  Location: ${e.location_name.substring(0, 60)}`);
        console.log(`  Image: ${e.image ? '✓' : '✗'}`);
        console.log(`  Link: ${e.link ? '✓' : '✗'}`);
        console.log(`  Raw Text: ${e.rawText}`);
      });
    }

    await browser.close();
    
    // Return filtered events without the debug rawText field
    return realEvents
      .filter(event => event.title && (event.date || event.location_name))
      .map(({ rawText, ...event }) => event);
  } catch (error) {
    console.error('Error scraping events:', error);
    await browser.close();
    return [];
  }
}

// Map scraped data to Supabase schema and upsert
async function upsertEvents(events: ScrapedEvent[]): Promise<void> {
  for (const event of events) {
    try {
      // Only process events with valid data
      if (!event.title || !event.date) {
        console.warn(`Skipping event with missing title or date`);
        continue;
      }

      // Parse date string (format: M/D/YYYY or MM/DD/YYYY)
      const dateParts = event.date.split('/');
      if (dateParts.length !== 3) {
        console.warn(`Skipping event with invalid date format: ${event.date}`);
        continue;
      }

      const month = dateParts[0].padStart(2, '0');
      const day = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      const eventDateStr = `${year}-${month}-${day}`; // YYYY-MM-DD format
      const startTimeStr = `${eventDateStr}T${defaultEventTime}Z`; // ISO format with Z for UTC

      // Generate unique external_id
      const external_id = generateExternalId(event.title, event.date);

      // Try to get venue coordinates from hardcoded mapping, fallback to Monterey center
      let lat = MONTEREY_CENTER.lat;
      let lon = MONTEREY_CENTER.lon;

      if (event.location_name && event.location_name.length > 2) {
        const coords = getCoords(event.location_name);
        if (coords) {
          lat = coords.lat;
          lon = coords.lon;
          console.log(`✓ Found venue "${event.location_name}" → ${lat}, ${lon}`);
        } else {
          console.log(`⚠ Unknown venue "${event.location_name}", using Monterey center`);
        }
      }

      // Prepare data for Supabase
      const eventData = {
        title: event.title,
        event_date: eventDateStr,
        venue_name: event.location_name || null,
        image_url: event.image || null,
        start_time: startTimeStr,
        location: `POINT(${lon} ${lat})`, // PostGIS POINT format: POINT(longitude latitude)
        external_id,
        source: 'seemonterey',
        creator_id: serviceUserId,
        overview: null,
        tags: []
      };

      // Upsert into events table
      const { data, error } = await supabase
        .from('events')
        .upsert([eventData], { onConflict: 'external_id' });

      if (error) {
        console.error(`Error upserting event "${event.title}":`, error);
      } else {
        console.log(`✓ Upserted: ${event.title} (${eventDateStr})`);
      }
    } catch (error) {
      console.error(`Error processing event "${event.title}":`, error);
    }
  }

  // Print unknown venues for easy reference
  if (unknownVenues.size > 0) {
    console.log('\n📍 Unknown venues found. Add these to lib/venues.ts:');
    Array.from(unknownVenues).forEach(venue => {
      console.log(`  - ${venue}`);
    });
  }
}

// Main execution
async function main() {
  console.log('Starting scraper...');
  const events = await scrapeSeeMonterey();
  console.log(`Found ${events.length} events`);
  
  if (events.length > 0) {
    console.log('Upserting events to Supabase...');
    await upsertEvents(events);
    console.log('Done!');
  }
}

main().catch(console.error);