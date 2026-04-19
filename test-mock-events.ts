// Test file to verify mock events and filtering logic
// Run with: npx ts-node test-mock-events.ts

// import { MOCK_EVENTS } from "./lib/mock-events";
import { getEvents } from "./lib/get-events";

// Test cases
async function runTests() {
  console.log("=== Test 1: All events ===");
  console.log((await getEvents({})).map((e) => e.title));

  console.log("\n=== Test 2: Filter by type 'Music' ===");
  console.log((await getEvents({ type: "Music" })).map((e) => e.title));

  console.log("\n=== Test 3: Filter by type 'Coffee & Cars' ===");
  console.log(
    (await getEvents({ type: "Coffee & Cars" })).map((e) => e.title)
  );

  console.log("\n=== Test 4: Date range (Sept 20 - Oct 15) ===");
  console.log(
    (
      await getEvents({
        dateFrom: "2025-09-20",
        dateTo: "2025-10-15",
      })
    ).map((e) => e.title)
  );

  console.log("\n=== Test 5: Bounding box (Monterey area) ===");
  console.log(
    (
      await getEvents({
        bounds: {
          swLat: 36.6,
          swLng: -121.92,
          neLat: 36.63,
          neLng: -121.89,
        },
      })
    ).map((e) => e.title)
  );

  console.log("\n=== Test 6: Type + Date range ===");
  console.log(
    (
      await getEvents({
        type: "sports",
        dateFrom: "2025-09-01",
        dateTo: "2025-12-31",
      })
    ).map((e) => e.title)
  );

  console.log("\n✅ All tests completed");
}

runTests();
