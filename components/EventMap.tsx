"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngBounds, LatLng } from "leaflet";
import { Event } from "../lib/mock-events";

type Props = {
  events: Event[];
  onBoundsChange: (bounds: {
    swLat: number; swLng: number; neLat: number; neLng: number;
  }) => void;
  onPinClick: (event: Event) => void;
};

// Color mapping for event types
const EVENT_TYPE_COLORS: Record<string, { primary: string; secondary: string; hex: string }> = {
  concert: { primary: "#a855f7", secondary: "#9333ea", hex: "%23a855f7" }, // Purple
  music: { primary: "#a855f7", secondary: "#9333ea", hex: "%23a855f7" }, // Purple
  food: { primary: "#22c55e", secondary: "#16a34a", hex: "%2322c55e" }, // Green
  restaurant: { primary: "#22c55e", secondary: "#16a34a", hex: "%2322c55e" }, // Green
  club: { primary: "#eab308", secondary: "#ca8a04", hex: "%23eab308" }, // Yellow
  meeting: { primary: "#eab308", secondary: "#ca8a04", hex: "%23eab308" }, // Yellow
  hike: { primary: "#eab308", secondary: "#ca8a04", hex: "%23eab308" }, // Yellow
  community: { primary: "#eab308", secondary: "#ca8a04", hex: "%23eab308" }, // Yellow
};

const getEventColor = (
  eventType: string
): { primary: string; secondary: string; hex: string } => {
  const normalized = eventType.toLowerCase();
  return EVENT_TYPE_COLORS[normalized] || { primary: "#ef4444", secondary: "#dc2626", hex: "%23ef4444" }; // Default red
};

// Placeholder SVG icon (grey user silhouette)
const PLACEHOLDER_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="35" r="20" fill="%23cbd5e1"/><path d="M 20 100 Q 20 60 50 60 Q 80 60 80 100" fill="%23cbd5e1"/></svg>`;

// Helper: Calculate distance between two lat/lng points in meters
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Convert to meters
};

// Helper: Find clusters of events at same location
const findClusters = (events: Event[], threshold: number = 50): Record<string, string[]> => {
  const clusters: Record<string, string[]> = {};
  const visited = new Set<string>();

  events.forEach((event) => {
    if (visited.has(event.id)) return;

    const cluster: string[] = [event.id];
    visited.add(event.id);

    events.forEach((other) => {
      if (visited.has(other.id) || other.id === event.id) return;
      const distance = calculateDistance(event.lat, event.lng, other.lat, other.lng);
      if (distance < threshold) {
        cluster.push(other.id);
        visited.add(other.id);
      }
    });

    if (cluster.length > 1) {
      clusters[event.id] = cluster;
    }
  });

  return clusters;
};

// Helper: Calculate separated positions for clustered markers
const calculateSeparatedPositions = (
  centerLat: number,
  centerLng: number,
  count: number,
  radius: number = 0.0002 // ~20 meters at zoom 14
): LatLng[] => {
  const positions: LatLng[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const lat = centerLat + radius * Math.cos(angle);
    const lng = centerLng + radius * Math.sin(angle);
    positions.push(L.latLng(lat, lng));
  }
  return positions;
};

function createPinIcon(eventType: string) {
  const colors = getEventColor(eventType);
  return L.divIcon({
    html: `<div class="pin-marker" data-type="${eventType}" style="--color-primary: ${colors.primary}; --color-secondary: ${colors.secondary};"></div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    className: "pin-marker-wrapper",
  });
}

function createAvatarIcon(imageUrl: string | null | undefined, eventType: string) {
  const backgroundImage = imageUrl || PLACEHOLDER_ICON;
  const colors = getEventColor(eventType);
  
  return L.divIcon({
    html: `<div class="avatar-marker" data-type="${eventType}" style="background-image: url('${backgroundImage}'); --color-primary: ${colors.primary};"></div>`,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    className: "avatar-marker-wrapper",
  });
}

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

function ZoomAwareMarkers({ events, onPinClick }: { events: Event[]; onPinClick: (event: Event) => void }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Zoom threshold: show avatars when zoom level is 14 or higher
  const ZOOM_THRESHOLD = 14;
  const showAvatars = zoom >= ZOOM_THRESHOLD;

  // Find clusters of events at same location
  const clusters = findClusters(events, 50); // 50 meters threshold

  // Calculate display positions for each event
  const getDisplayPosition = (event: Event): [number, number] => {
    // Check if this event is part of a cluster
    for (const [clusterId, clusterMembers] of Object.entries(clusters)) {
      if (clusterMembers.includes(event.id)) {
        // If cluster is expanded, use separated positions
        if (expandedClusterId === clusterId) {
          const clusterEvent = events.find((e) => e.id === clusterId)!;
          const separatedPositions = calculateSeparatedPositions(
            clusterEvent.lat,
            clusterEvent.lng,
            clusterMembers.length,
            0.0003 // ~30 meters
          );
          const index = clusterMembers.indexOf(event.id);
          return [separatedPositions[index].lat, separatedPositions[index].lng];
        }
        break;
      }
    }
    return [event.lat, event.lng];
  };

  const handleMarkerClick = (event: Event) => {
    // Check if this marker is a cluster head
    if (clusters[event.id]) {
      // Toggle expansion
      setExpandedClusterId(expandedClusterId === event.id ? null : event.id);
    } else {
      // Check if it's part of a cluster
      let partOfCluster = false;
      for (const [clusterId, clusterMembers] of Object.entries(clusters)) {
        if (clusterMembers.includes(event.id)) {
          // Click on a clustered marker - expand its cluster
          setExpandedClusterId(clusterId);
          partOfCluster = true;
          break;
        }
      }
      
      // If not part of a cluster, trigger normal pin click
      if (!partOfCluster) {
        onPinClick(event);
      }
    }
  };

  useEffect(() => {
    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on("zoom", handleZoom);
    return () => {
      map.off("zoom", handleZoom);
    };
  }, [map]);

  // Update marker icons and positions when zoom changes or cluster expands
  useEffect(() => {
    Object.entries(markerRefs.current).forEach(([eventId, marker]) => {
      const event = events.find((e) => e.id === eventId);
      if (event) {
        const newIcon = showAvatars ? createAvatarIcon(event.picture, event.type) : createPinIcon(event.type);
        marker.setIcon(newIcon);
        
        // Update position if it's in an expanded cluster
        const [lat, lng] = getDisplayPosition(event);
        marker.setLatLng([lat, lng]);
      }
    });
  }, [showAvatars, events, expandedClusterId, zoom]);

  return (
    <>
      {events.map((event) => {
        const [displayLat, displayLng] = getDisplayPosition(event);
        const isClusterHead = clusters[event.id];
        
        return (
          <Marker
            key={event.id}
            position={[displayLat, displayLng]}
            icon={showAvatars ? createAvatarIcon(event.picture, event.type) : createPinIcon(event.type)}
            eventHandlers={{ click: () => handleMarkerClick(event) }}
            ref={(el) => {
              if (el) markerRefs.current[event.id] = el;
            }}
            zIndexOffset={expandedClusterId === event.id ? 1000 : isClusterHead ? 100 : 0}
          >
            <Popup>
              <strong>{event.title}</strong>
              <br />
              <span className="text-xs">{event.location}</span>
              {isClusterHead && clusters[event.id].length > 1 && (
                <>
                  <br />
                  <span className="text-xs text-slate-500">
                    +{clusters[event.id].length - 1} more event{clusters[event.id].length - 1 !== 1 ? "s" : ""} at this location
                  </span>
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

export default function EventMap({ events, onBoundsChange, onPinClick }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ height: "100%", width: "100%" }} />;

  return (
    <>
      <style>{`
        /* Pin Marker Wrapper - for zoomed out view */
        .pin-marker-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Pin Marker - traditional map pin style */
        .pin-marker {
          width: 32px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-primary, #ef4444) 0%, var(--color-secondary, #dc2626) 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
          position: relative;
        }

        .pin-marker::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          top: 6px;
          left: 50%;
          transform: translateX(-50%);
        }

        .pin-marker:hover {
          transform: rotate(-45deg) scale(1.2);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        /* Avatar Marker Wrapper - container for the marker */
        .avatar-marker-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Avatar Marker - circular thumbnail with border and shadow */
        .avatar-marker {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 4px solid var(--color-primary, #ef4444);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }

        /* Hover state - scale up to 1.5x */
        .avatar-marker:hover {
          transform: scale(1.5);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        /* Leaflet marker container smooth transitions */
        .leaflet-marker-pane .leaflet-marker {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Ensure Leaflet popup styling works well */
        .leaflet-popup-content-wrapper {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .leaflet-popup-content {
          margin: 8px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
      `}</style>

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
        <ZoomAwareMarkers events={events} onPinClick={onPinClick} />
      </MapContainer>
    </>
  );
}
