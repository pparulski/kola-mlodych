
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MapContainerProps {
  mapComponent: ReactNode;
  listComponent: ReactNode;
  showMapOnMobile: boolean;
  toggleMapView: () => void;
  isMobile: boolean;
}

/**
 * Container component that handles the map and list layout
 * including mobile view toggling
 */
export const MapContainer = ({
  mapComponent,
  listComponent,
  showMapOnMobile,
  toggleMapView,
  isMobile
}: MapContainerProps) => {
  return (
    <>
      {/* Mobile View Toggle Button */}
      {isMobile && (
        <Button 
          onClick={toggleMapView}
          variant="outline"
          className="w-full mb-1"
        >
          {showMapOnMobile ? "Pokaż listę" : "Pokaż mapę"}
        </Button>
      )}
      
      <div className={cn(
        "flex flex-col md:flex-row gap-1",
        "h-[calc(100vh-100px)] md:min-h-[600px]"
      )}>
        {/* Map Section - Now slightly smaller on desktop */}
        <div className={cn(
          "w-full md:w-3/5 h-full aspect-square rounded-lg overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[80vw] max-h-[calc(100vh-150px)]" // Square on mobile with max height
        )}>
          {mapComponent}
        </div>
        
        {/* Unions List Section - Now wider on desktop */}
        <div className={cn(
          "w-full md:w-2/5 h-full overflow-y-auto pr-0 border rounded-lg",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
