
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapView } from "@/components/map/MapView";
import { UnionsList } from "@/components/map/UnionsList";
import { useUnionsData } from "@/components/map/hooks/useUnionsData";
import { Union } from "@/components/map/types";

/**
 * UnionsMap page component that displays a map of union locations
 * and a list of unions that can be interacted with.
 */
const UnionsMap = () => {
  const isMobile = useIsMobile();
  const [selectedUnion, setSelectedUnion] = useState<string | null>(null);
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);
  const [popupInfo, setPopupInfo] = useState<Union | null>(null);

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
            />
          )}
        </div>
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-1/2 overflow-auto pr-1",
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
