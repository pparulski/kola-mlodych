
import { Button } from "../ui/button";
import { Image } from "lucide-react";
import { FileUpload } from "../FileUpload";
import { toast } from "sonner";

interface StaticPageImageUploadProps {
  featuredImage: string | null;
  onImageUpload: (url: string) => void;
}

export function StaticPageImageUpload({ featuredImage, onImageUpload }: StaticPageImageUploadProps) {
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleImageUpload = (name: string, url: string) => {
    onImageUpload(url);
    setShowImageUpload(false);
    toast.success("Zdjęcie zostało dodane");
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowImageUpload(!showImageUpload)}
        >
          <Image className="mr-2 h-4 w-4" />
          {featuredImage ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
        </Button>
        {featuredImage && (
          <img
            src={featuredImage}
            alt="Featured"
            className="h-20 w-20 object-cover rounded"
          />
        )}
      </div>

      {showImageUpload && (
        <div className="mb-4">
          <FileUpload
            bucket="static_pages_images"
            onSuccess={handleImageUpload}
            acceptedFileTypes="image/*"
          />
        </div>
      )}
    </>
  );
}
