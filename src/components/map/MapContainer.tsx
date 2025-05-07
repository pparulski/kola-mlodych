
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
          className="w-full mb-2"
        >
          {showMapOnMobile ? "Pokaż listę" : "Pokaż mapę"}
        </Button>
      )}
      
      <div className={cn(
        "flex flex-col md:flex-row gap-1",
        "h-[calc(100vh-100px)] md:min-h-[600px]"
      )}>
        {/* Map Section */}
        <div className={cn(
          "w-full md:w-4/5 lg:w-4/5 h-full aspect-square rounded-lg overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[calc(100vh-130px)]"
        )}>
          {mapComponent}
        </div>
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-1/5 lg:w-1/5 overflow-auto pr-0",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
