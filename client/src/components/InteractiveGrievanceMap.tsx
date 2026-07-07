'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet coordinate mappings for Lucknow districts/wards
const LUCKNOW_GPS: Record<string, { lat: number; lng: number }> = {
  'Hazratganj': { lat: 26.8500, lng: 80.9499 },
  'Gomti Nagar': { lat: 26.8600, lng: 80.9700 },
  'Alambagh': { lat: 26.8100, lng: 80.9000 },
  'Chowk': { lat: 26.8650, lng: 80.9150 },
  'Indira Nagar': { lat: 26.8900, lng: 80.9900 },
  'Aminabad': { lat: 26.8400, lng: 80.9280 },
  'Mahanagar': { lat: 26.8750, lng: 80.9500 },
  'Jankipuram': { lat: 26.9200, lng: 80.9400 },
  'Ashiyana': { lat: 26.7900, lng: 80.9200 },
  'Charbagh': { lat: 26.8300, lng: 80.9200 }
};

interface PriorityItem {
  id: string;
  title: string;
  category: string;
  village: string;
  urgency: string;
  status: string;
  supporters: number;
  estimatedCostLakhs: number;
  priorityScore: number;
  populationAffected: number;
  location_lat?: number;
  location_lng?: number;
}

interface VillageNode {
  name: string;
  block: string;
  lat: number;
  lng: number;
  complaints: number;
  urgencyLevel: string;
  categories: Record<string, number>;
  totalBeneficiaries: number;
  topSuggestion: string;
}

interface InteractiveGrievanceMapProps {
  complaints: PriorityItem[];
  selectedVillage: VillageNode | null;
  onSelectVillage: (village: VillageNode | null) => void;
  villages: VillageNode[];
  activeLayer: string;
}

const urgencyColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

// Deterministic coordinates jittering based on suggestion ID
const getJitteredCoords = (id: string, baseLat: number, baseLng: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generates small deterministic offsets between -0.007 and +0.007
  const latOffset = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.014;
  const lngOffset = ((Math.abs(hash >> 10) % 1000) / 1000 - 0.5) * 0.014;
  return {
    lat: baseLat + latOffset,
    lng: baseLng + lngOffset
  };
};

// Sub-component to control map viewport updates
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
};

export default function InteractiveGrievanceMap({
  complaints,
  selectedVillage,
  onSelectVillage,
  villages,
  activeLayer
}: InteractiveGrievanceMapProps) {
  const [mounted, setMounted] = React.useState(false);
  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [selectedVillage]);

  // Set center to selected village coordinate or default to central Lucknow
  const mapCenter: [number, number] = selectedVillage && LUCKNOW_GPS[selectedVillage.name]
    ? [LUCKNOW_GPS[selectedVillage.name].lat, LUCKNOW_GPS[selectedVillage.name].lng]
    : [26.8467, 80.9462];
    
  const mapZoom = selectedVillage ? 14 : 12;

  // Filter complaints based on active category layer filter
  const displayedComplaints = complaints.filter(c => {
    if (activeLayer === 'all') return true;
    return c.category === activeLayer;
  });

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[550px] flex flex-col items-center justify-center bg-[#0a0d1e] rounded-3xl border border-[#1e293b]/40">
        <svg className="w-8 h-8 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-[10px] text-slate-455 uppercase tracking-widest font-black mt-3 animate-pulse">Loading GIS Telemetry Map...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[550px] relative z-0 rounded-3xl overflow-hidden border border-[#1e293b]/40">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        zoomControl={false} 
        style={{ height: '100%', width: '100%', background: '#0a0d1e' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Scattered Dotted Complaint Markers */}
        {displayedComplaints.map((c) => {
          const villageName = c.village || 'Hazratganj';
          const baseCoords = LUCKNOW_GPS[villageName] || LUCKNOW_GPS['Hazratganj'];
          
          // Apply deterministic jitter/scatter coordinates based on suggestion ID
          const coords = getJitteredCoords(c.id, baseCoords.lat, baseCoords.lng);
          const color = urgencyColors[c.urgency] || urgencyColors.low;

          return (
            <CircleMarker
              key={c.id}
              center={[coords.lat, coords.lng]}
              radius={7}
              pathOptions={{
                fillColor: color,
                color: '#ffffff',
                weight: 1.2,
                opacity: 0.9,
                fillOpacity: 0.8
              }}
              eventHandlers={{
                click: () => {
                  const matchingVillage = villages.find(v => v.name === villageName);
                  if (matchingVillage) {
                    onSelectVillage(matchingVillage);
                  }
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -5]} opacity={0.95}>
                <div className="bg-[#0f142c] text-white p-2 rounded-lg border border-slate-800 text-[10px] space-y-1 font-sans">
                  <p className="font-extrabold text-slate-100 max-w-[180px]">{c.title}</p>
                  <div className="flex items-center justify-between gap-4 text-[8px] text-slate-400 font-bold border-t border-slate-800 pt-1">
                    <span className="uppercase text-indigo-400">{c.category}</span>
                    <span className="uppercase px-1 py-0.5 rounded bg-slate-900" style={{ color }}>{c.urgency}</span>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
