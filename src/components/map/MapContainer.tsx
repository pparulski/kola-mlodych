
import { ReactNode } from "react";
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
          {/* Hint pill inside map container */}
          <div className="absolute left-3 top-3 md:left-4 md:top-4 z-[2] pointer-events-none">
            <div className="text-foreground/90 bg-background/90 dark:bg-black border border-dashed border-foreground/50 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl text-xs md:text-sm shadow-sm font-hand">
              Kliknij w logo!
            </div>
          </div>
        </div>
        
        {/* Unions List Section - Bottom position (temporarily hidden) */}
        <div className="hidden w-full overflow-auto border rounded-lg h-[50vh]">
          {listComponent}
        </div>
     </div>
   );
  }
  
  // Desktop layout - Side by side (map left, list right)
  return (
    <div className="relative flex flex-row gap-1 items-start justify-center">
      {/* Map Section - Left position with square aspect ratio */}
      <div className="w-full md:w-5/6 lg:w-4/6 relative rounded-lg overflow-hidden border">
        <AspectRatio ratio={1}>
          <div className="w-full h-full">
            {mapComponent}
          </div>
        </AspectRatio>
       {/* Hint pill inside map container */}
       <div className="absolute left-3 top-3 md:left-4 md:top-4 z-[2] pointer-events-none">
         <div className="text-foreground/90 bg-background/90 dark:bg-black border border-dashed border-foreground/50 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl text-xs md:text-sm shadow-sm font-hand">
           Kliknij w logo!
         </div>
       </div>
     </div>
     
     {/* Unions List Section - Right position */}
      <div className="hidden w-2/6 overflow-auto border rounded-lg">
        {listComponent}
      </div>
    </div>
  );
};
