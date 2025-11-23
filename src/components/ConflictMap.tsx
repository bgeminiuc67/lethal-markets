import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Conflict } from '@/types/conflict';
import { mockConflicts } from '@/data/mockData';

interface ConflictMapProps {
  conflicts?: Conflict[];
  onConflictSelect?: (conflict: Conflict) => void;
}

export const ConflictMap: React.FC<ConflictMapProps> = ({ 
  conflicts = mockConflicts,
  onConflictSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // TODO: Connect to Supabase secrets for Mapbox token
    const mapboxToken = 'pk.eyJ1IjoidGVtcC11c2VyIiwiYSI6ImNrdXNlcjEyMyJ9.demo_token';
    
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 2,
      center: [20, 30],
      pitch: 0,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Add atmosphere
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(10, 10, 20)',
        'high-color': 'rgb(30, 30, 60)',
        'horizon-blend': 0.1,
      });

      // Add conflict markers
      conflicts.forEach(conflict => {
        const severity = conflict.severity;
        const color = {
          low: '#fbbf24',
          medium: '#f97316', 
          high: '#ef4444',
          critical: '#dc2626'
        }[severity];

        const marker = new mapboxgl.Marker({
          color,
          scale: severity === 'critical' ? 1.2 : 1.0
        })
          .setLngLat(conflict.location.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold text-sm">${conflict.name}</h3>
                  <p class="text-xs text-gray-600">${conflict.location.country}</p>
                  <p class="text-xs">Status: ${conflict.status}</p>
                  <p class="text-xs">Severity: ${conflict.severity}</p>
                </div>
              `)
          )
          .addTo(map.current!);

        marker.getElement().addEventListener('click', () => {
          onConflictSelect?.(conflict);
        });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [conflicts, onConflictSelect]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg border border-border" />
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 text-sm">
        <h3 className="font-semibold mb-2">Active Conflicts</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-xs">Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
};