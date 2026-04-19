"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import { Event } from "@/lib/mock-events";
import { TYPE_COLORS } from "@/lib/event-colors";

type Props = {
  events: Event[];
  onBoundsChange: (bounds: {
    swLat: number; swLng: number; neLat: number; neLng: number;
  }) => void;
  onPinClick: (event: Event) => void;
};

function BoundsWatcher({ onBoundsChange }: { onBoundsChange: Props["onBoundsChange"] }) {
  const map = useMapEvents({
    moveend: () => emitBounds(),
    zoomend: () => emitBounds(),
    load: () => emitBounds(),
  });

  const emitBounds = () => {
    const b: LatLngBounds = map.getBounds();
    onBoundsChange({
      swLat: b.getSouth(),
      swLng: b.getWest(),
      neLat: b.getNorth(),
      neLng: b.getEast(),
    });
  };

  // emit on first render
  const emitted = useRef(false);
  useEffect(() => {
    if (!emitted.current) {
      emitted.current = true;
      emitBounds();
    }
  });

  return null;
}

export default function EventMap({ events, onBoundsChange, onPinClick }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ height: "100%", width: "100%" }} />;

  return (
    <MapContainer
      center={[36.6002, -121.8947]}
      zoom={11}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundsWatcher onBoundsChange={onBoundsChange} />
      {events.map((event) => {
        const color = TYPE_COLORS[event.type] ?? TYPE_COLORS["default"];
        return (
          <CircleMarker
            key={event.id}
            center={[event.lat, event.lng]}
            radius={10}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.9,
              color: "#fff",
              weight: 2,
            }}
            eventHandlers={{ click: () => onPinClick(event) }}
          >
            <Popup>
              <strong>{event.title}</strong>
              <br />
              <span className="text-xs">{event.location}</span>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
