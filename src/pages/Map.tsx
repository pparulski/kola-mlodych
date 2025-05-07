
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  Users 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mapbox access token - in production this should be stored in an environment variable
const MAPBOX_TOKEN = "pk.eyJ1IjoiYXNhZGRpaDQiLCJhIjoiY2xqdHllN2xuMWN4dDNmcnhqdXcybGVrbSJ9.uwPA8K3Z7SLdScGwZ6WPDw";

// Interface for latitude/longitude coordinates for union locations
interface Coordinates {
  lat: number;
  lng: number;
}

// Defining an interface for union data - updated to match Supabase return type
interface Union {
  id: string;
  name: string;
  bio?: string | null;
  logo_url?: string | null;
  year_created?: number;
  contact?: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  region?: string | null;
  city?: string | null;
  created_at?: string;
  coordinates?: Coordinates; // Added coordinates for map positioning
}

// Hard-coded coordinates for Polish cities where unions are located
// In a production app, these would come from your database
const cityCoordinates: Record<string, Coordinates> = {
  "Warszawa": { lat: 52.2297, lng: 21.0122 },
  "Kraków": { lat: 50.0647, lng: 19.9450 },
  "Łódź": { lat: 51.7592, lng: 19.4560 },
  "Wrocław": { lat: 51.1079, lng: 17.0385 },
  "Poznań": { lat: 52.4064, lng: 16.9252 },
  "Gdańsk": { lat: 54.3520, lng: 18.6466 },
  "Katowice": { lat: 50.2649, lng: 19.0238 },
  "Szczecin": { lat: 53.4285, lng: 14.5528 },
  "Lublin": { lat: 51.2465, lng: 22.5684 },
  "Białystok": { lat: 53.1325, lng: 23.1688 },
  "Toruń": { lat: 53.0137, lng: 18.5981 },
  "Rzeszów": { lat: 50.0412, lng: 21.9991 },
  "Olsztyn": { lat: 53.7784, lng: 20.4801 },
  "Bydgoszcz": { lat: 53.1235, lng: 18.0084 },
  "Częstochowa": { lat: 50.8118, lng: 19.1203 },
  "Zielona Góra": { lat: 51.9356, lng: 15.5062 },
  "Gdynia": { lat: 54.5189, lng: 18.5305 },
  "Płock": { lat: 52.5468, lng: 19.7064 },
  "Kielce": { lat: 50.8661, lng: 20.6286 },
  // Default coordinates for cities not in the list
  "default": { lat: 52.0693, lng: 19.4803 } // Center of Poland
};

const UnionsMap = () => {
  const isMobile = useIsMobile();
  const mapRef = useRef(null);
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [popupInfo, setPopupInfo] = useState<Union | null>(null);

  // Fetch unions data from Supabase
  const { data: unions, isLoading } = useQuery({
    queryKey: ['unions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Add coordinates based on city
      const unionsWithCoordinates = data.map(union => ({
        ...union,
        coordinates: union.city && cityCoordinates[union.city] 
          ? cityCoordinates[union.city] 
          : cityCoordinates.default
      }));
      
      return unionsWithCoordinates as Union[];
    }
  });

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
  const handleMarkerClick = (unionId: string) => {
    setSelectedUnion(unionId === selectedUnion ? null : unionId);
    
    // Find the union to set popup info
    const union = unions?.find(u => u.id === unionId);
    if (union) setPopupInfo(union);
    
    // Scroll to the union card in the list
    const element = document.getElementById(`union-card-${unionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // On mobile, show the list after selecting a marker
    if (isMobile) {
      setShowMapOnMobile(false);
    }
  };

  // Handle card click/hover
  const handleCardInteraction = (unionId: string) => {
    setSelectedUnion(unionId);
    
    // Find the union for popup info
    const union = unions?.find(u => u.id === unionId);
    if (union) setPopupInfo(union);
  };

  // Toggle map view on mobile
  const toggleMapView = () => {
    setShowMapOnMobile(!showMapOnMobile);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center w-full">
          <div className="h-8 w-48 bg-muted rounded mb-4"></div>
          <div className="h-[400px] w-full bg-muted rounded mb-4"></div>
          <div className="grid gap-4 w-full md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Mobile View Toggle Button */}
      {isMobile && (
        <div className="mb-4 flex justify-center">
          <Button 
            onClick={toggleMapView}
            variant="outline"
            className="w-full"
          >
            {showMapOnMobile ? "Pokaż listę" : "Pokaż mapę"}
          </Button>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col md:flex-row gap-4",
        "h-[calc(100vh-150px)] md:min-h-[600px]"
      )}>
        {/* Map Section */}
        <div className={cn(
          "w-full md:w-1/2 h-full rounded-xl overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[calc(100vh-200px)]"
        )}>
          {unions && (
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: mapCenter[0],
                latitude: mapCenter[1],
                zoom: 6
              }}
              mapStyle="mapbox://styles/mapbox/light-v10"
              dragRotate={false}
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
                    onClick={() => handleMarkerClick(union.id)}
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
              {popupInfo && (
                <Popup
                  longitude={popupInfo.coordinates?.lng || 0}
                  latitude={popupInfo.coordinates?.lat || 0}
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
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-1/2 overflow-auto pr-1",
          isMobile && showMapOnMobile && "hidden"
        )}>
          <div className="grid gap-4 grid-cols-1">
            {unions?.map((union) => (
              <Card 
                key={union.id}
                id={`union-card-${union.id}`}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  "hover:shadow-md",
                  selectedUnion === union.id ? "ring-2 ring-primary/50" : ""
                )}
                onClick={() => handleCardInteraction(union.id)}
                onMouseEnter={() => handleCardInteraction(union.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl break-words">{union.name}</CardTitle>
                      {union.city && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{union.city}</span>
                        </div>
                      )}
                    </div>
                    
                    {union.logo_url && (
                      <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center">
                        <img 
                          src={union.logo_url} 
                          alt={`Logo ${union.name}`}
                          className="max-h-16 max-w-16 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pb-3 pt-2">
                  {union.year_created && (
                    <Badge variant="outline" className="mb-3">
                      <Users className="mr-1 h-3 w-3" />
                      Rok założenia: {union.year_created}
                    </Badge>
                  )}
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="bio" className="border-0">
                      <AccordionTrigger className="py-1 text-sm text-primary hover:no-underline">
                        O organizacji
                      </AccordionTrigger>
                      <AccordionContent>
                        {union.bio ? (
                          <p className="text-sm text-muted-foreground">
                            {union.bio}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Brak szczegółowego opisu.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>

                <CardFooter className="flex justify-between items-center pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    {union.contact && (
                      <a 
                        href={`mailto:${union.contact}`}
                        className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                        title={union.contact}
                      >
                        <Mail className="h-4 w-4" />
                        <span className="hidden md:inline">Kontakt</span>
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {union.facebook_url && (
                      <a 
                        href={union.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
                        title="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {union.instagram_url && (
                      <a 
                        href={union.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
                        title="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnionsMap;
