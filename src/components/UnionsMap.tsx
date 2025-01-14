import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "./ui/card";

export function UnionsMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-74.5, 40],
      zoom: 9,
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  return (
    <div className="space-y-4">
      {!mapboxToken && (
        <Card className="p-4">
          <p className="text-sm text-gray-700 mb-2">
            Please enter your Mapbox public token to view the map. You can get one at{" "}
            <a href="https://mapbox.com" className="text-accent underline" target="_blank" rel="noopener noreferrer">
              mapbox.com
            </a>
          </p>
          <input
            type="text"
            placeholder="Enter Mapbox token"
            className="w-full p-2 border rounded"
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </Card>
      )}
      <div ref={mapContainer} className="h-[600px] rounded-lg shadow-lg" />
    </div>
  );
}