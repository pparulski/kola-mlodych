
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"
import { Button } from "@/components/ui/button"

interface CarouselDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of slides to render dots for
   */
  count: number;
  /**
   * When true, shows the dots even for a single slide
   */
  alwaysShow?: boolean;
}

const CarouselDots = React.forwardRef<
  HTMLDivElement,
  CarouselDotsProps
>(({ className, count, alwaysShow = false, ...props }, ref) => {
  const { api, scrollTo, selectedIndex } = useCarousel()

  // Don't render dots if there's only one slide unless alwaysShow is true
  if (count <= 1 && !alwaysShow) return null

  return (
    <div 
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-1 my-2",
        className
      )}
      aria-label="Carousel pagination"
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => {
        const isActive = selectedIndex === index
        return (
          <Button
            key={index}
            size="sm"
            variant="ghost"
            className={cn(
              "size-2 rounded-full p-0 transition-all",
              isActive 
                ? "bg-primary scale-110" 
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={isActive ? "true" : "false"}
          />
        )
      })}
    </div>
  )
})

CarouselDots.displayName = "CarouselDots"

export { CarouselDots }
