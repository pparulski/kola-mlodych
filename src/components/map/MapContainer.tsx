
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
        {/* Map Section - Top position with square aspect ratio */}
        <div className="w-full relative rounded-lg overflow-hidden border">
          <AspectRatio ratio={1}>
            <div className="w-full h-full">
              {mapComponent}
            </div>
          </AspectRatio>
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
    <div className="flex flex-row gap-1 items-start">
      {/* Map Section - Left position with square aspect ratio */}
      <div className="w-4/6 relative rounded-lg overflow-hidden border">
        <AspectRatio ratio={1}>
          <div className="w-full h-full">
            {mapComponent}
          </div>
        </AspectRatio>
      </div>
      
      {/* Unions List Section - Right position */}
      <div className="w-2/6 overflow-auto border rounded-lg">
        {listComponent}
      </div>
    </div>
  );
};
