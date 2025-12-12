// src/components/ebooks/page/EbooksAlarmCarousel.tsx
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel"; // Your carousel components
import { EbookCover } from "../card/EbookCover"; // Your EbookCover
import { Ebook } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { slugify } from "@/utils/slugUtils";

interface EbooksAlarmCarouselProps {
  ebooks: Ebook[];
}

export function EbooksAlarmCarousel({ ebooks }: EbooksAlarmCarouselProps) {
  const isMobile = useIsMobile();
  const [sortedEbooks, setSortedEbooks] = useState<Ebook[]>([]);

  useEffect(() => {
    const sorted = [...ebooks].sort((a, b) => {
      const dateA = new Date(a.created_at || "").getTime();
      const dateB = new Date(b.created_at || "").getTime();
      return dateB - dateA;
    });
    setSortedEbooks(sorted);
  }, [ebooks]);

  if (!sortedEbooks.length) return null;


  // --- Configuration for item sizing and peeking ---
  let itemBasis: string;
  let itemsToConsiderForLoop: number; // How many items are mostly in view

  // Define how many items you want primarily visible before peeking
  const mobilePrimaryVisibleItems = 1;
  const desktopLargePrimaryVisibleItems = 5;

  if (isMobile) {
    itemsToConsiderForLoop = mobilePrimaryVisibleItems;
    // Basis slightly less than 100% / (num_items + peek_fraction)
    // For 1 item + peek (e.g., 0.1 of next item visible), effective items = 1.1
    // Basis = 100 / 1.1 = ~90.9%
    itemBasis = "basis-[90%]"; // Adjust for more/less peek
  } else {
    // Example: Use window width to determine basis for desktop for more fine-grained control
    // This is a basic example; you might use a more robust breakpoint hook for window.innerWidth
    // For simplicity here, we'll use your existing breakpoints from EbookCover indirectly
    // by selecting a basis that generally fits N items.
    // The idea is: basis = 100 / (N_items_to_show_mostly + small_fraction_for_peek)
    // Example: show 4 items + peek => 100 / 4.2 = ~23.8%
    // Example: show 5 items + peek => 100 / 5.2 = ~19.2%
    
    // Using Tailwind responsive prefixes for basis directly on CarouselItem is cleaner
    itemBasis = "basis-[48%] sm:basis-[31%] md:basis-[24%] lg:basis-[19%]"; 
    // basis-[48%] ~ 2 items + peek
    // sm:basis-[31%] ~ 3 items + peek
    // md:basis-[24%] ~ 4 items + peek
    // lg:basis-[19%] ~ 5 items + peek

    // Determine items for loop based on the largest typical view
    itemsToConsiderForLoop = desktopLargePrimaryVisibleItems; 
  }
  
  return (
    <div 
      className="relative w-full" // Let Carousel handle its own padding if needed
      aria-label="E-books carousel"
      role="region"
    >
      <Carousel
        opts={{
          align: "start", // Aligns the first "full" item to the start, allows peeking
          loop: false,
          dragFree: true,
          // slidesToScroll: 1, // Default
        }}
        // Add horizontal padding to the Carousel itself if you want space on the ends
        // This keeps items truly touching but gives breathing room for the whole carousel
        className="w-full px-1 md:px-2" 
      >
        <CarouselContent className=""> 
          {/* NO negative margins here because CarouselItems won't have pl/pr for gaps */}
          {sortedEbooks.map((ebook, i) => (
            <CarouselItem 
              key={ebook.id} 
              index={i}
              // Apply the responsive basis.
              // Add a very small padding if you want a tiny line between covers, otherwise p-0.
              className={`${itemBasis} p-0.5`} // p-0.5 creates a 1px gap effectively if covers are edge-to-edge inside
            >
              {/* This inner div ensures EbookCover fills the CarouselItem correctly */}
              <Link
                to={`/ebooks/${ebook.slug || slugify(ebook.title)}`}
                className="w-full h-full block"
                aria-label={`Przejdź do strony publikacji: ${ebook.title}`}
              >
                <EbookCover
                  coverUrl={ebook.cover_url}
                  title={ebook.title}
                  size="fill"
                  aspectRatioValue={180/240}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselDots 
          count={sortedEbooks.length} 
          className="mt-2 mb-4" // Dots below the carousel
        />
        
        {/* Arrows are positioned relative to the Carousel component */}
        {!isMobile && sortedEbooks.length > itemsToConsiderForLoop && (
          <>
            {/* Adjust arrow positioning if Carousel has px (e.g., left-2, right-2) */}
            <CarouselPrevious 
              variant="outline" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border/40 shadow-md hover:bg-background z-10" 
            />
            <CarouselNext 
              variant="outline" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-border/40 shadow-md hover:bg-background z-10"
            />
          </>
        )}
      </Carousel>
    </div>
  );
}