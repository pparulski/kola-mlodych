
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
        "h-[calc(100vh-150px)] md:min-h-[500px]"
      )}>
        {/* Map Section - Square aspect ratio preserved */}
        <div className={cn(
          "w-full md:w-1/2 aspect-square rounded-lg overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[70vw] max-h-[calc(100vh-180px)]" // Smaller square on mobile
        )}>
          {mapComponent}
        </div>
        
        {/* Unions List Section - Now wider */}
        <div className={cn(
          "w-full md:w-1/2 h-full overflow-hidden border rounded-lg",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
