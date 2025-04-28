
import { FileUpload } from "@/components/FileUpload";
import { Label } from "@/components/ui/label";
import { FeaturedImage } from "@/components/common/FeaturedImage";
import { cn } from "@/lib/utils";

interface FeaturedImageUploadProps {
  featuredImage: string | null;
  setFeaturedImage: (url: string) => void;
}

export function FeaturedImageUpload({ 
  featuredImage, 
  setFeaturedImage 
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
        />
      </div>
      
      <p className="text-sm text-muted-foreground mt-2">
        Zalecane wymiary: 1200×675 px (16:9) lub 1680x720 px (21:9). 
        Zdjęcie będzie wyświetlane w proporcjach 16:9 w widoku artykułu i 21:9 na liście.
      </p>
    </div>
  );
}
