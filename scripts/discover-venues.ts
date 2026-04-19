/**
 * Utility script to scrape and discover all unique venues from seemonterey.com
 * Run with: npx ts-node --transpile-only scripts/discover-venues.ts
 */

import 'dotenv/config';
import { chromium } from 'playwright';

async function discoverVenues() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('📍 Discovering venues from seemonterey.com...\n');

    // Go to the events page
    await page.goto('https://www.seemonterey.com/events/', { waitUntil: 'networkidle' });

    // Wait for dynamic content
    await page.waitForTimeout(3000);

    // Find event containers
    const eventSelectors = [
      'div[class*="event-card"]',
      'div[class*="listing"]',
      'li[class*="event"]',
      '.flex.flex-col',
      '[data-event-id]',
      'article[class*="event"]'
    ];

    let foundSelector = null;
    for (const selector of eventSelectors) {
      const count = await page.locator(selector).count();
      if (count > 5) {
        foundSelector = selector;
        break;
      }
    }

    if (!foundSelector) {
      console.error('Could not find event containers');
      await browser.close();
      return;
    }

    // Scroll down to load more events by clicking "Load More" button
    console.log('⏳ Loading all events by clicking "Load More" button...');
    let eventCount = await page.locator(foundSelector).count();
    console.log(`  Initial events: ${eventCount}`);

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

      if (newEventCount === eventCount) {
        console.log('✓ No new events loaded');
        break;
      }

      eventCount = newEventCount;
      loadMoreAttempts++;
    }

    console.log(`\n✓ Finished loading. Total events visible: ${await page.locator(foundSelector).count()}\n`);

    // Extract venues
    const venues = await page.evaluate((selector) => {
      const items = Array.from(document.querySelectorAll(selector));
      const venueSet = new Set<string>();

      items.forEach((item) => {
        const allText = item.textContent || '';
        const lines = allText.split('\n').map(l => l.trim()).filter(l => l);

        const locationEl = item.querySelector('[class*="location"], [class*="venue"], [class*="address"]');
        let location = locationEl?.textContent?.trim() || '';

        // Try to extract from text if not found in element
        if (!location && lines.length > 2) {
          location = lines.find(l =>
            !l.match(/^\d+\/\d+/) &&
            !l.match(/^\d+:\d+/) &&
            l.length > 5 &&
            l.length < 80
          ) || '';
        }

        if (location && location.length > 3) {
          venueSet.add(location);
        }
      });

      return Array.from(venueSet).sort();
    }, foundSelector);

    console.log(`Found ${venues.length} unique venues:\n`);

    // Format for easy copy-paste into venues.ts
    venues.forEach((venue, index) => {
      const key = venue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');

      console.log(`  '${key}': {`);
      console.log(`    name: '${venue}',`);
      console.log(`    lat: 0, // TODO: Add coordinates`);
      console.log(`    lon: 0, // TODO: Add coordinates`);
      console.log(`  },`);

      if (index < venues.length - 1) {
        console.log('');
      }
    });

    console.log('\n💡 Tip: Copy the above and paste into lib/venues.ts, then look up coordinates for each venue.');
    console.log('   You can use Google Maps or OpenStreetMap to find the coordinates.');

  } catch (error) {
    console.error('Error discovering venues:', error);
  } finally {
    await browser.close();
  }
}

discoverVenues();
