
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapContainerProps {
  mapComponent: ReactNode;
  listComponent: ReactNode;
  isMobile: boolean;
}

/**
 * Container component that handles the map and list layout
 * with different layouts for mobile and desktop
 */
export const MapContainer = ({
  mapComponent,
  listComponent,
  isMobile
}: MapContainerProps) => {
  // Return a different layout based on the device type
  if (isMobile) {
    // Mobile layout - Stacked (map on top, list below)
    return (
      <div className="flex flex-col gap-3">
        {/* Map Section - Top position */}
        <div className="w-full relative rounded-lg overflow-hidden border h-[70vh]">
          <div className="w-full h-full">
            {mapComponent}
          </div>
        </div>
        
        {/* Unions List Section - Bottom position */}
        <div className="w-full overflow-auto border rounded-lg h-[50vh]">
          {listComponent}
        </div>
      </div>
    );
  }
  
  // Desktop layout - Side by side (map left, list right)
  return (
    <div className="flex flex-row gap-4">
      {/* Map Section - Left position */}
      <div className="w-3/5 relative rounded-lg overflow-hidden border h-[70vh]">
        <div className="w-full h-full">
          {mapComponent}
        </div>
      </div>
      
      {/* Unions List Section - Right position */}
      <div className="w-2/5 overflow-auto border rounded-lg h-[70vh]">
        {listComponent}
      </div>
    </div>
  );
};
