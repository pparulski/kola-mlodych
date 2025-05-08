
import { useState } from "react";
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

interface EbooksAlarmCarouselProps {
  ebooks: Ebook[];
}

export function EbooksAlarmCarousel({ ebooks }: EbooksAlarmCarouselProps) {
  const isMobile = useIsMobile();

  if (!ebooks.length) return null;

  const handleOpenPdf = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: ebooks.length > 3,
        }}
        className="w-full"
      >
        <CarouselContent>
          {ebooks.map((ebook) => (
            <CarouselItem 
              key={ebook.id} 
              className={isMobile ? "basis-full" : "basis-1/2 md:basis-1/3 lg:basis-1/4"}
            >
              <div className="p-1 flex flex-col items-center">
                <div
                  className="cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-[1.03]"
                  onClick={() => handleOpenPdf(ebook.file_url)}
                >
                  <EbookCover
                    coverUrl={ebook.cover_url}
                    title={ebook.title}
                    size="medium"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {ebooks.length > (isMobile ? 1 : 3) && (
          <>
            <div className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2">
              <CarouselPrevious className="relative left-0" />
            </div>
            <div className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2">
              <CarouselNext className="relative right-0" />
            </div>
          </>
        )}
      </Carousel>
    </div>
  );
}
