
import { useRef, useEffect } from "react";
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Union, POLAND_BOUNDS, POLAND_CENTER } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

// Set the Mapbox token
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGF5ZWsyOSIsImEiOiJjbWFlaWE4aTYwMHFjMmpzMzhxbGhiNG9wIn0.9p3d1MoBwalUlgd2Gv7xzQ";

interface MapViewProps {
  unions: Union[];
  selectedUnion: string | null;
  setSelectedUnion: (id: string) => void;
  popupInfo: Union | null;
  setPopupInfo: (union: Union | null) => void;
}

/**
 * MapView component that renders the Mapbox map with union markers
 */
export const MapView = ({ 
  unions, 
  selectedUnion, 
  setSelectedUnion,
  popupInfo,
  setPopupInfo
}: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();
  
  // Adjust the map view on initial load and window resize
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Increased padding to ensure Poland is fully visible in square container
    const padding = isMobile 
      ? { top: 60, bottom: 60, left: 60, right: 60 } 
      : { top: 80, bottom: 80, left: 80, right: 80 };
    
    // Fit map to bounds with appropriate padding
    mapRef.current.fitBounds(POLAND_BOUNDS, {
      padding,
      duration: 0 // Instant fit
    });
  }, [isMobile]);
  
  // Handle marker click
  const handleMarkerClick = (union: Union) => {
    setSelectedUnion(union.id === selectedUnion ? "" : union.id);
    setPopupInfo(union);
  };

  return (
    <div className="w-full h-full">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: POLAND_CENTER[0],
          latitude: POLAND_CENTER[1],
          zoom: 4.5
        }}
        maxBounds={POLAND_BOUNDS}
        mapStyle="mapbox://styles/mapbox/light-v10"
        dragRotate={false}
        minZoom={3.5}
        maxZoom={10}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        
        {/* Map Markers - only render markers with valid coordinates */}
        {unions
          .filter(union => union.coordinates)
          .map((union) => (
            <Marker
              key={union.id}
              longitude={union.coordinates!.lng}
              latitude={union.coordinates!.lat}
              onClick={() => handleMarkerClick(union)}
              anchor="bottom"
              scale={1} // Ensure consistent icon size regardless of zoom
            >
              <div className={cn(
                "cursor-pointer transition-transform duration-200",
                selectedUnion === union.id ? "text-primary scale-125" : "text-accent"
              )}>
                <MapPin size={28} strokeWidth={selectedUnion === union.id ? 3 : 2} />
              </div>
            </Marker>
          ))
        }
        
        {/* Popup for selected marker - Fixed text color in dark mode */}
        {popupInfo && popupInfo.coordinates && (
          <Popup
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            anchor="bottom"
            closeButton={true}
            closeOnClick={false}
            onClose={() => setPopupInfo(null)}
            className="z-10"
            maxWidth="300px"
          >
            <div className="p-1 text-foreground dark:text-black">
              <h3 className="font-bold text-sm">{popupInfo.name}</h3>
              {popupInfo.city && <p className="text-xs">{popupInfo.city}</p>}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
