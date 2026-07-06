'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Crosshair, Loader2 } from 'lucide-react';

// Fix for default marker icon in Leaflet with Next.js/Webpack
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  );
};

const LocateControl = ({ setPosition }: { setPosition: (pos: L.LatLng) => void }) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      setLocating(false);
    },
    locationerror(e) {
      alert("Could not access your location. Please check browser permissions.");
      setLocating(false);
    }
  });

  return (
    <div className="absolute bottom-6 right-4 z-1000">
      <button 
        type="button"
        onClick={handleLocate} 
        disabled={locating}
        className="bg-white border border-slate-200 p-3 rounded-full shadow-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer group"
        title="Detect Live Location"
      >
        {locating ? (
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        ) : (
          <Crosshair className="w-6 h-6 group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};

export default function MapPicker({ initialLat, initialLng, onLocationSelect }: MapPickerProps) {
  // Default to Varanasi if no initial coordinates are provided
  const defaultCenter = { lat: initialLat || 25.3176, lng: initialLng || 82.9739 };
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  // When the user confirms their selection
  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
    }
  };

  return (
    <div className="flex flex-col h-[400px] w-full rounded-xl overflow-hidden border border-slate-700">
      <div className="flex-1 relative z-0">
        <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <LocateControl setPosition={setPosition} />
        </MapContainer>
      </div>
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
        <div className="text-xs text-slate-400">
          {position ? (
            <span>Selected: <span className="text-white font-bold">{position.lat.toFixed(5)}, {position.lng.toFixed(5)}</span></span>
          ) : (
            <span>Click anywhere on the map to drop a pin</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!position}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
