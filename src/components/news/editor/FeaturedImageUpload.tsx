
import { FileUpload } from "@/components/FileUpload";
import { Label } from "@/components/ui/label";

interface FeaturedImageUploadProps {
  featuredImage: string | null;
  setFeaturedImage: (url: string) => void;
}

export function FeaturedImageUpload({ 
  featuredImage, 
  setFeaturedImage 
}: FeaturedImageUploadProps) {
  return (
    <div>
      <Label htmlFor="featured-image">Zdjęcie wyróżniające</Label>
      <FileUpload
        onUpload={(url) => setFeaturedImage(url)}
        currentValue={featuredImage}
        acceptedFileTypes="image/*"
      />
    </div>
  );
}
