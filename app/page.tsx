"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import EventModal from "@/components/EventModal";
import EventSidebar from "@/components/EventSidebar";
import { getEvents, BoundsFilter } from "@/lib/get-events";
import { Event } from "@/lib/mock-events";

const EventMap = dynamic(() => import("@/components/EventMap"), { ssr: false });

export default function Home() {
  const [activeType, setActiveType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [bounds, setBounds] = useState<BoundsFilter | undefined>(undefined);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchEvents = useCallback(async () => {
    const results = await getEvents({ type: activeType, dateFrom, dateTo, bounds });
    setEvents(results);
  }, [activeType, dateFrom, dateTo, bounds]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleBoundsChange = useCallback((b: BoundsFilter) => {
    setBounds(b);
  }, []);

  return (
    <main>
      <HeroSection />

      <section id="map-section" className="flex flex-col" style={{ height: "100vh" }}>
        <FilterBar
          activeType={activeType}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onTypeChange={setActiveType}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <EventMap
              events={events}
              onBoundsChange={handleBoundsChange}
              onPinClick={setSelectedEvent}
            />
          </div>
          <EventSidebar
            events={events}
            selectedEvent={selectedEvent}
            onEventClick={setSelectedEvent}
          />
        </div>
      </section>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}
