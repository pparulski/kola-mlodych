import { useState, useEffect, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EbookCover } from "../card/EbookCover";
import { Ebook } from "../types";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EbooksAlarmCarouselProps {
  ebooks: Ebook[];
}

export function EbooksAlarmCarousel({ ebooks }: EbooksAlarmCarouselProps) {
  const isMobile = useIsMobile();
  const [sortedEbooks, setSortedEbooks] = useState<Ebook[]>([]);

  // Sort ebooks by creation date (newest first)
  useEffect(() => {
    const sorted = [...ebooks].sort((a, b) => {
      // Compare by created_at field (assuming it exists)
      const dateA = new Date(a.created_at || "").getTime();
      const dateB = new Date(b.created_at || "").getTime();
      return dateB - dateA; // newest first
    });
    setSortedEbooks(sorted);
  }, [ebooks]);

  if (!ebooks.length) return null;

  const handleOpenPdf = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const getItemsPerView = () => {
    if (isMobile) return 1.2; // Show 1 full item + 20% of the next one on mobile
    return 4.2; // Show 4 full items + 20% of the next one on larger screens
  };

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: ebooks.length > getItemsPerView(),
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {sortedEbooks.map((ebook) => (
            <CarouselItem 
              key={ebook.id} 
              className={isMobile ? "pl-2 basis-4/5" : "pl-4 basis-1/5 md:basis-1/4 lg:basis-1/5"}
            >
              <div className="p-1">
                <div
                  className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-[1.03] aspect-[2/3]"
                  onClick={() => handleOpenPdf(ebook.file_url)}
                >
                  <EbookCover
                    coverUrl={ebook.cover_url}
                    title={ebook.title}
                    size="medium"
                  />
                </div>
                <p className="mt-2 text-center text-sm font-medium line-clamp-1">{ebook.title}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {ebooks.length > getItemsPerView() && (
          <>
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <CarouselPrevious 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 shadow-md hover:bg-background" 
              />
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <CarouselNext 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 shadow-md hover:bg-background" 
              />
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
