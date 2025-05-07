
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MapContainerProps {
  mapComponent: ReactNode;
  listComponent: ReactNode;
  showMapOnMobile: boolean;
  toggleMapView: () => void;
  onOpenTokenSettings: () => void;
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
  onOpenTokenSettings,
  isMobile
}: MapContainerProps) => {
  return (
    <>
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
          onClick={onOpenTokenSettings}
          className={cn(isMobile ? "hidden" : "ml-auto")}
        >
          Zmień token Mapbox
        </Button>
      </div>
      
      <div className={cn(
        "flex flex-col md:flex-row gap-2",
        "h-[calc(100vh-120px)] md:min-h-[600px]"
      )}>
        {/* Map Section */}
        <div className={cn(
          "w-full md:w-3/4 lg:w-3/4 h-full rounded-xl overflow-hidden border",
          isMobile && !showMapOnMobile && "hidden",
          isMobile && showMapOnMobile && "h-[calc(100vh-150px)]"
        )}>
          {mapComponent}
        </div>
        
        {/* Unions List Section */}
        <div className={cn(
          "w-full md:w-1/4 lg:w-1/4 overflow-auto pr-0.5",
          isMobile && showMapOnMobile && "hidden"
        )}>
          {listComponent}
        </div>
      </div>
    </>
  );
};
