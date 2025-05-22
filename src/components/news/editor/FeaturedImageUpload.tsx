
import { FileUpload } from "@/components/FileUpload";
import { Label } from "@/components/ui/label";
import { FeaturedImage } from "@/components/common/FeaturedImage";
import { cn } from "@/lib/utils";

interface FeaturedImageUploadProps {
  featuredImage: string | null;
  setFeaturedImage: (url: string) => void;
  quality?: number; // Add quality option for featured images
}

export function FeaturedImageUpload({ 
  featuredImage, 
  setFeaturedImage,
  quality = 85 // Higher quality for featured images
}: FeaturedImageUploadProps) {
  return (
    <div className="space-y-4">
      <Label htmlFor="featured-image">Zdjęcie wyróżniające</Label>
      
      {featuredImage && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Podgląd zdjęcia (w różnych proporcjach):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Widok artykułu (16:9)</p>
              <FeaturedImage 
                src={featuredImage} 
                aspectRatio={16/9}
                className={cn("border border-border")}
                lazyload={false} // Don't lazy load previews
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Widok listy (21:9)</p>
              <FeaturedImage 
                src={featuredImage} 
                aspectRatio={21/9}
                className={cn("border border-border")}
                lazyload={false} // Don't lazy load previews
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <FileUpload
          onUpload={(url) => setFeaturedImage(url)}
          currentValue={featuredImage}
          acceptedFileTypes="image/*"
          bucket="news_images"
          compress={true}
          quality={quality}
          uploadId="featured-image"
        />
      </div>
      
      <div className="space-y-2 text-sm text-muted-foreground mt-2 p-3 bg-muted/50 rounded-md border border-border">
        <h4 className="font-medium text-foreground">Wskazówki dotyczące zdjęć:</h4>
        <p>
          <strong>Zalecane wymiary:</strong> 1200×675 px (16:9) lub 1680×720 px (21:9)
        </p>
        <p>
          <strong>Jak będzie wyświetlane:</strong> W proporcjach 16:9 w widoku artykułu i 21:9 na liście aktualności.
        </p>
        <p>
          <strong>Format:</strong> Zdjęcie zostanie automatycznie zoptymalizowane i przekonwertowane do formatu WebP.
        </p>
        <p>
          <strong>Zalecenia:</strong> Preferujemy zdjęcia z lokalnych wydarzeń, przedstawiające aktywność związkową.
          Wybieraj zdjęcia ostre, dobrze oświetlone i o odpowiedniej rozdzielczości.
        </p>
        <p>
          <strong>Uwaga:</strong> Zdjęcie wyróżniające będzie wykorzystywane w podglądach na portalach społecznościowych
          (Open Graph) i jest kluczowym elementem przyciągającym uwagę czytelników.
        </p>
      </div>
    </div>
  );
}
