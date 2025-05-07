
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map/MapView";
import { UnionsList } from "@/components/map/UnionsList";
import { useUnionsData } from "@/components/map/hooks/useUnionsData";
import { Union } from "@/components/map/types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * UnionsMap page component that displays a map of union locations
 * and a list of unions that can be interacted with.
 */
const UnionsMap = () => {
  const isMobile = useIsMobile();
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [popupInfo, setPopupInfo] = useState<Union | null>(null);
  
  // Get Mapbox token from localStorage or use empty string
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  
  const [isSettingToken, setIsSettingToken] = useState<boolean>(!mapboxToken);

  // Save token to localStorage when it changes
  useEffect(() => {
    if (mapboxToken) {
      localStorage.setItem('mapbox_token', mapboxToken);
    }
  }, [mapboxToken]);

  // Fetch unions data from Supabase using our custom hook
  const { data: unions, isLoading } = useUnionsData();

  // Handle card click/hover
  const handleCardInteraction = (unionId: string) => {
    setSelectedUnion(unionId);
    
    // Find the union for popup info
    const union = unions?.find(u => u.id === unionId);
    if (union) setPopupInfo(union);
    
    // Scroll the card into view if not visible
    const element = document.getElementById(`union-card-${unionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Toggle map view on mobile
  const toggleMapView = () => {
    setShowMapOnMobile(!showMapOnMobile);
  };
  
  // Handle token submission
  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingToken(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-2 py-4 flex items-center justify-center min-h-[300px]">
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

  // Show token input form if needed
  if (isSettingToken) {
    return (
      <div className="container mx-auto px-2 py-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Konfiguracja mapy</CardTitle>
            <CardDescription>
              Aby korzystać z mapy, potrzebny jest token dostępu do Mapbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mapbox_token" className="text-sm font-medium">
                  Token Mapbox
                </label>
                <Input
                  id="mapbox_token"
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  placeholder="pk.eyJ1IjoieW91..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Możesz uzyskać token na stronie{" "}
                  <a 
                    href="https://account.mapbox.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Mapbox
                  </a>
                </p>
              </div>
              <Button type="submit" className="w-full">Zapisz token</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-3">
      <div className="flex justify-between items-center mb-2">
        {/* Mobile View Toggle Button */}
        {isMobile && (
          <Button 
            onClick={toggleMapView}
            variant="outline"
            className="w-full"
          >
            {showMapOnMobile ? "Pokaż listę" : "Pokaż mapę"}
          </Button>
        )}
        
        {/* Mapbox token button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsSettingToken(true)}
          className={cn(isMobile ? "hidden" : "ml-auto")}
        >
          Zmień token Mapbox
        </Button>
      </div>
      
      <div className={cn(
        "flex flex-col md:flex-row gap-2",
        "h-[calc(100vh-120px)] md:min-h-[650px]"
      )}>
        {/* Map Section */}
        <div className={cn(
          "w-full md:w-3/5 lg:w-2/3 h-full rounded-xl overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[calc(100vh-150px)]"
        )}>
          {unions && (
            <MapView 
              unions={unions} 
              selectedUnion={selectedUnion}
              setSelectedUnion={(id) => {
                setSelectedUnion(id === selectedUnion ? null : id);
                
                // Find the union to set popup info
                const union = unions?.find(u => u.id === id);
                if (union) setPopupInfo(union);
                
                // On mobile, show the list after selecting a marker
                if (isMobile) {
                  setShowMapOnMobile(false);
                }
                
                // Scroll to the union card in the list
                const element = document.getElementById(`union-card-${id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              popupInfo={popupInfo}
              setPopupInfo={setPopupInfo}
              mapboxToken={mapboxToken}
            />
          )}
        </div>
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-2/5 lg:w-1/3 overflow-auto pr-1",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {unions && (
            <UnionsList
              unions={unions}
              selectedUnion={selectedUnion}
              handleCardInteraction={handleCardInteraction}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UnionsMap;
