
import * as React from "react"
import { cn } from "@/lib/utils"
import { useCarousel } from "./context"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-1 md:-ml-2" : "-mt-1 md:-mt-2 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
})

CarouselContent.displayName = "CarouselContent"

export { CarouselContent }
