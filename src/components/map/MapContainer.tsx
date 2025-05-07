
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
        "h-[calc(100vh-120px)] md:min-h-[550px]"
      )}>
        {/* Map Section - Square aspect ratio preserved */}
        <div className={cn(
          "w-full md:w-3/5 md:h-auto aspect-square rounded-lg overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[80vw] max-h-[calc(100vh-150px)]" // Square on mobile with max height
        )}>
          {mapComponent}
        </div>
        
        {/* Unions List Section - Now same height as map */}
        <div className={cn(
          "w-full md:w-2/5 h-full overflow-hidden border rounded-lg",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
