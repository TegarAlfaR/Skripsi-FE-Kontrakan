"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/**
 * Reusable Leaflet map for a single unit.
 * @param {number|string} lat
 * @param {number|string} lng
 * @param {string} label - popup text (e.g. unit name)
 * @param {number} zoom
 * @param {string} heightClass - tailwind height class, default h-80
 */
export default function UnitMap({
  lat,
  lng,
  label,
  zoom = 15,
  heightClass = "h-80",
}) {
  const position = [parseFloat(lat), parseFloat(lng)];

  if (Number.isNaN(position[0]) || Number.isNaN(position[1])) {
    return (
      <div
        className={`w-full ${heightClass} rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm`}
      >
        Koordinat lokasi tidak tersedia.
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={false}
      className={`w-full ${heightClass} z-0`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={markerIcon}>
        <Popup>{label}</Popup>
      </Marker>
    </MapContainer>
  );
}
