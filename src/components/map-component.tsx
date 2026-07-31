"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  priceRange?: string;
  source?: "db" | "osm";
}

interface MapComponentProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (id: string) => void;
  selectedId?: string | null;
}

export function MapComponent({
  markers,
  center = [23.685, 90.356],
  zoom = 7,
  onMarkerClick,
  selectedId,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const orangeIcon = new L.DivIcon({
      className: "custom-marker",
      html: `<div style="background:#ea580c;color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:14px;font-weight:bold;">B</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const osmIcon = new L.DivIcon({
      className: "custom-marker-osm",
      html: `<div style="background:#16a34a;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:13px;font-weight:bold;">B</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const selectedIcon = new L.DivIcon({
      className: "custom-marker-selected",
      html: `<div style="background:#1d4ed8;color:white;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 12px rgba(0,0,0,0.4);font-size:16px;font-weight:bold;">B</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    markers.forEach((marker) => {
      const isSelected = marker.id === selectedId;
      const isOsm = marker.source === "osm";
      const leafletMarker = L.marker([marker.latitude, marker.longitude], {
        icon: isSelected ? selectedIcon : isOsm ? osmIcon : orangeIcon,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="font-family:system-ui;min-width:150px">
            <strong style="font-size:14px;color:#1f2937">${marker.name}</strong><br/>
            <span style="font-size:12px;color:#6b7280">${marker.address}</span>
            ${marker.priceRange ? `<br/><span style="font-size:12px;color:#ea580c;font-weight:600">${marker.priceRange}</span>` : ""}
            ${isOsm ? `<br/><span style="font-size:11px;color:#16a34a;font-weight:600">Live · OpenStreetMap</span>` : ""}
            ${!isOsm ? `<br/><br/><a href="/bhatas/${marker.id}" style="display:inline-block;padding:4px 12px;background:#ea580c;color:white;border-radius:6px;font-size:12px;text-decoration:none">View Details</a>` : ""}
          </div>`
        );

      if (onMarkerClick) {
        leafletMarker.on("click", () => onMarkerClick(marker.id));
      }

      markersRef.current.push(leafletMarker);
    });

    if (markers.length > 0 && !selectedId) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [markers, selectedId]);

  return <div ref={mapContainerRef} className="h-[400px] w-full rounded-xl border border-gray-200 z-0" />;
}
