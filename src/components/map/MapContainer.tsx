
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapContainerProps {
  mapComponent: ReactNode;
  listComponent: ReactNode;
  isMobile: boolean;
}

/**
 * Container component that handles the map and list layout
 * with a vertical stacked design (map on top, list below)
 */
export const MapContainer = ({
  mapComponent,
  listComponent,
  isMobile
}: MapContainerProps) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Map Section - Top position */}
      <div className={cn(
        "w-full relative rounded-lg overflow-hidden border",
        isMobile ? "h-[65vw]" : "h-[50vh]" // Adjusted height for better map visibility
      )}>
        <div className="w-full h-full">
          {mapComponent}
        </div>
      </div>
      
      {/* Unions List Section - Bottom position */}
      <div className={cn(
        "w-full overflow-auto border rounded-lg",
        isMobile ? "h-[50vh]" : "h-[40vh]" // Responsive height for list
      )}>
        {listComponent}
      </div>
    </div>
  );
};
