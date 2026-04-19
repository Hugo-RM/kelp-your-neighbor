"use client";

import { useEffect, useMemo, useRef } from "react";
import L, { type LeafletMouseEvent } from "leaflet";

interface LocationState {
  lat: number;
  lng: number;
}

export interface FlareMapClientProps {
  location: LocationState;
  onLocationChange: (next: LocationState) => void;
}

export default function FlareLocationMap({
  location,
  onLocationChange,
}: FlareMapClientProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  const flareIcon = useMemo(
    () =>
      L.divIcon({
        className: "",
        html: '<div style="height:30px;width:30px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#fb923c,#f97316);box-shadow:0 0 0 3px rgba(255,255,255,0.9), 0 10px 22px rgba(249,115,22,0.45);font-size:16px;">🔥</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      }),
    []
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) {
      return;
    }

    const containerElement = container as HTMLDivElement & { _leaflet_id?: number };
    if (containerElement._leaflet_id) {
      delete containerElement._leaflet_id;
    }

    const map = L.map(container, {
      zoomControl: true,
    }).setView([location.lat, location.lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const marker = L.marker([location.lat, location.lng], {
      icon: flareIcon,
      draggable: true,
    }).addTo(map);

    map.on("click", (event: LeafletMouseEvent) => {
      onLocationChangeRef.current({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    });

    marker.on("dragend", () => {
      const latLng = marker.getLatLng();
      onLocationChangeRef.current({
        lat: latLng.lat,
        lng: latLng.lng,
      });
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.off();
      map.off();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [flareIcon, location.lat, location.lng]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) {
      return;
    }

    marker.setLatLng([location.lat, location.lng]);
    map.flyTo([location.lat, location.lng], map.getZoom(), {
      duration: 0.6,
    });
  }, [location.lat, location.lng]);

  return <div ref={containerRef} className="h-[320px] w-full" />;
}
