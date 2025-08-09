
import { useRef, useEffect, useState } from "react";
import Map, { Marker, NavigationControl, Popup, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Facebook, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkerIcon } from "./MarkerIcon";
import { Union, POLAND_BOUNDS, POLAND_CENTER } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

// Set the Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;



type Anchor = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

interface MapViewProps {
  unions: Union[];
  selectedUnion: string | null;
  setSelectedUnion: (id: string) => void;
  popupInfo: Union | null;
  setPopupInfo: (union: Union | null) => void;
  targetCity?: string;
  onProjectPoint?: (screenLeft: number, screenTop: number) => void;
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
  targetCity,
  onProjectPoint
}: MapViewProps) => {
  const mapRef = useRef<MapRef>(null);
  const isMobile = useIsMobile();
  const [emailCopied, setEmailCopied] = useState(false);

  // Reset copied state when popupInfo changes (open another popup)
  useEffect(() => {
    setEmailCopied(false);
  }, [popupInfo?.id]);
  
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

    // Project a target city to screen to help draw the pointer arrow from page
    if (targetCity) {
      const union = unions.find(u => u.city?.toLowerCase() === targetCity.toLowerCase() && u.coordinates);
      if (union && onProjectPoint) {
        const p = mapRef.current.getMap().project([union.coordinates!.lng, union.coordinates!.lat]);
        const canvasRect = mapRef.current.getMap().getCanvas().getBoundingClientRect();
        onProjectPoint(canvasRect.left + p.x, canvasRect.top + p.y);
      }
    }
  }, [isMobile, targetCity, unions, onProjectPoint]);
  
  // Handle marker click
  const handleMarkerClick = (union: Union) => {
    setSelectedUnion(union.id);
    setPopupInfo(union);
    // Reverted: remove smart recenter behavior (return to prior behavior)
  };

 const popupAnchor: Anchor = popupInfo?.city?.toLowerCase() === 'szczecin'
   ? 'left'
   : (popupInfo?.city?.toLowerCase() === 'gdańsk' || popupInfo?.city?.toLowerCase() === 'gdansk')
     ? 'top'
     : 'bottom';


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
        onDrag={() => { if (popupInfo) setPopupInfo(null); }}
        onStyleData={() => {
          const m = mapRef.current?.getMap();
          if (!m) return;
          const hideLayer = (id: string) => {
            try { m.setLayoutProperty(id, 'visibility', 'none'); } catch {}
          };
          hideLayer('country-label');
          hideLayer('country-label-sm');
          hideLayer('country-label-lg');
          // Hide any other symbol layer with country in id
          const style = m.getStyle();
          if (style?.layers) {
            for (const layer of style.layers as any[]) {
              if (layer.type === 'symbol' && /country/i.test(layer.id)) {
                hideLayer(layer.id);
              }
            }
          }
        }}
      >
        <NavigationControl position="top-right" />
        {/* Hide country labels but keep city labels */}
        {/* @ts-ignore optional chaining for style layers */}
        {/* We'll run this on styledata change to be safe */}
        
        {/* Map Markers - only render markers with valid coordinates */}
        {unions
          .filter(union => union.coordinates)
          .map((union) => (
            <Marker
              key={union.id}
              longitude={union.coordinates!.lng}
              latitude={union.coordinates!.lat}
              anchor="bottom"
              scale={1}
            >
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkerClick(union); }}
                className={cn(
                  "cursor-pointer transition-transform duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary/60 rounded-full",
                  selectedUnion === union.id ? "scale-110" : "hover:scale-105 scale-100"
                )}
                aria-label={`${union.name}`}
              >
                <MarkerIcon src={union.logo_url} alt={union.name} selected={selectedUnion === union.id} />
              </button>
            </Marker>
          ))
        }
        
        {/* Popup for selected marker - Fixed text color in dark mode */}
        {!isMobile && popupInfo && popupInfo.coordinates && (
          <Popup
            focusAfterOpen={false}
            closeOnMove={true}
            longitude={popupInfo.coordinates.lng}
            latitude={popupInfo.coordinates.lat}
            anchor={popupAnchor}
            closeButton={false}
            closeOnClick={true}
            onClose={() => setPopupInfo(null)}
            className="z-10 custom-popup"
            offset={popupInfo.city?.toLowerCase() === 'gdańsk' || popupInfo.city?.toLowerCase() === 'gdansk' ? 8 : 24}
            maxWidth="280px"
          >
           <div className="relative px-2 py-1.5 text-foreground dark:text-foreground rounded-lg border border-black/70 dark:border-white/80 shadow-md bg-background">
             {/* Custom pointer aligned to anchor side */}
             {popupAnchor === 'left' && (
               <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-background border border-black/70 dark:border-white/80" />
             )}
             {popupAnchor === 'top' && (
               <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-2.5 h-2.5 rotate-45 bg-background border border-black/70 dark:border-white/80" />
             )}
             {popupAnchor === 'bottom' && (
               <span className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-2.5 h-2.5 rotate-45 bg-background border border-black/70 dark:border-white/80" />
             )}
             <div className="flex items-center gap-2 mb-2">
               <div className="shrink-0">
                 <MarkerIcon src={popupInfo.logo_url} alt={popupInfo.name} selected={true} />
               </div>
               <h3 className="font-bold text-sm leading-tight">{popupInfo.name}</h3>
             </div>
             <div className="flex items-center gap-2 flex-wrap">
               {popupInfo.contact && (
                 <button
                   type="button"
                   onClick={async (e) => {
                     try {
                       await navigator.clipboard.writeText(popupInfo.contact!);
                       setEmailCopied(true);
                       const btn = (e.currentTarget as HTMLButtonElement);
                       btn.classList.add('animate-scale-in');
                       setTimeout(() => btn.classList.remove('animate-scale-in'), 250);
                       setTimeout(() => setEmailCopied(false), 1200);
                     } catch (err) {
                       console.error('Copy failed');
                     }
                   }}
                   aria-label="Skopiuj adres e-mail"
                   title="Skopiuj adres e-mail"
                   className="px-2 py-1 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
                 >
                   <span className="text-[11px] font-medium">{emailCopied ? 'SKOPIOWANO' : 'EMAIL'}</span>
                   <Mail className="h-4 w-4" />
                 </button>
               )}
               {popupInfo.facebook_url && (
                 <a
                   href={popupInfo.facebook_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Otwórz stronę na Facebooku"
                   title="Facebook"
                   className="px-2 py-1 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
                 >
                   <span className="text-[11px] font-medium">FB</span>
                   <Facebook className="h-4 w-4" />
                 </a>
               )}
               {popupInfo.instagram_url && (
                 <a
                   href={popupInfo.instagram_url}
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Otwórz profil na Instagramie"
                   title="Instagram"
                   className="px-2 py-1 rounded-full hover:bg-accent/10 text-accent hover:text-primary transition-colors flex items-center gap-2 border"
                 >
                   <span className="text-[11px] font-medium">IG</span>
                   <Instagram className="h-4 w-4" />
                 </a>
               )}
             </div>
           </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};
