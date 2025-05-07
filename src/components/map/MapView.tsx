
import { useMemo, useRef, useState } from "react";
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Union } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Default token will be replaced with a user-provided one
const DEFAULT_MAPBOX_TOKEN = "YOUR_MAPBOX_TOKEN";

interface MapViewProps {
  unions: Union[];
  selectedUnion: string | null;
  setSelectedUnion: (id: string) => void;
  popupInfo: Union | null;
  setPopupInfo: (union: Union | null) => void;
  mapboxToken?: string;
}

/**
 * MapView component that renders the Mapbox map with union markers
 */
export const MapView = ({ 
  unions, 
  selectedUnion, 
  setSelectedUnion,
  popupInfo,
  setPopupInfo,
  mapboxToken = DEFAULT_MAPBOX_TOKEN
}: MapViewProps) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Calculate the center of all union locations for initial map view
  const mapCenter = useMemo(() => {
    if (!unions || unions.length === 0) {
      return [19.4803, 52.0693]; // Default center of Poland
    }

    const validCoordinates = unions.filter(union => union.coordinates);
    if (validCoordinates.length === 0) return [19.4803, 52.0693];
    
    const sumLat = validCoordinates.reduce((sum, union) => sum + (union.coordinates?.lat || 0), 0);
    const sumLng = validCoordinates.reduce((sum, union) => sum + (union.coordinates?.lng || 0), 0);
    
    return [sumLng / validCoordinates.length, sumLat / validCoordinates.length];
  }, [unions]);
  
  // Handle marker click
  const handleMarkerClick = (union: Union) => {
    setSelectedUnion(union.id === selectedUnion ? "" : union.id);
    setPopupInfo(union);
  };

  // Handle map load error
  const handleMapError = (error: any) => {
    console.error("Map error:", error);
    setMapError("Wystąpił błąd podczas wczytywania mapy. Sprawdź token dostępu do Mapbox.");
  };

  if (!mapboxToken || mapboxToken === DEFAULT_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 border rounded-lg">
        <div className="max-w-md p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Wymagany jest ważny token Mapbox. Proszę podać poprawny token API Mapbox.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {mapError ? (
        <div className="w-full h-full flex items-center justify-center bg-muted/20 border rounded-lg">
          <div className="max-w-md p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          </div>
        </div>
      ) : (
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: mapCenter[0],
            latitude: mapCenter[1],
            zoom: 6
          }}
          mapStyle="mapbox://styles/mapbox/light-v10"
          dragRotate={false}
          style={{ width: '100%', height: '100%' }}
          onError={handleMapError}
        >
          <NavigationControl position="top-right" />
          
          {/* Map Markers */}
          {unions.map((union) => {
            if (!union.coordinates) return null;
            
            return (
              <Marker
                key={union.id}
                longitude={union.coordinates.lng}
                latitude={union.coordinates.lat}
                onClick={() => handleMarkerClick(union)}
                anchor="bottom"
              >
                <div className={cn(
                  "cursor-pointer transition-transform duration-200",
                  selectedUnion === union.id ? "text-primary scale-125" : "text-accent"
                )}>
                  <MapPin size={28} strokeWidth={selectedUnion === union.id ? 3 : 2} />
                </div>
              </Marker>
            );
          })}
          
          {/* Popup for selected marker */}
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
              <div className="p-2">
                <h3 className="font-bold text-sm">{popupInfo.name}</h3>
                {popupInfo.city && <p className="text-xs">{popupInfo.city}</p>}
              </div>
            </Popup>
          )}
        </Map>
      )}
    </div>
  );
};
