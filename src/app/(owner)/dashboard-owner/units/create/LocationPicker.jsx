"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Komponen dalam map yang handle klik
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * @param {{ lat: string, lng: string, onPick: (lat: number, lng: number) => void }} props
 */
export default function LocationPicker({ lat, lng, onPick }) {
  const hasPin = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));
  const position = hasPin ? [parseFloat(lat), parseFloat(lng)] : null;

  // Default center: Cileungsi, Bogor
  const defaultCenter = [-6.419139, 107.002778];

  return (
    <MapContainer
      center={position ?? defaultCenter}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-72 rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {position && <Marker position={position} icon={markerIcon} />}
    </MapContainer>
  );
}