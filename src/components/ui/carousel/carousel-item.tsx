
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { index?: number }
>(({ className, index, ...props }, ref) => {
  const { orientation } = useCarousel()

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={`Slide ${index !== undefined ? index + 1 : ''}`} 
      className={cn(
        "min-w-0 shrink-0 grow-0",
        className
      )}
      {...props}
    />
  )
})

CarouselItem.displayName = "CarouselItem"

export { CarouselItem }
