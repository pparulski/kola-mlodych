
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
          "w-full md:w-4/5 md:h-full relative rounded-lg overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[80vw]" // 80vw for mobile to maintain square aspect ratio
        )}>
          {/* This inner div maintains square aspect ratio while filling width */}
          <div className="aspect-square w-full h-full">
            {mapComponent}
          </div>
        </div>
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-1/5 h-full overflow-hidden border rounded-lg",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
