
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { Image as ImageIcon } from "lucide-react";
import { GalleryImage } from "@/types/galleries";
import { GalleryImageItem } from "./GalleryImageItem";

interface GalleryImagesManagerProps {
  galleryId: string;
  galleryImages: GalleryImage[] | undefined;
  isImagesLoading: boolean;
}

export function GalleryImagesManager({ 
  galleryId, 
  galleryImages, 
  isImagesLoading 
}: GalleryImagesManagerProps) {
  const queryClient = useQueryClient();

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);
        
      if (error) throw error;
      return imageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success("Zdjęcie usunięte");
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error("Nie udało się usunąć zdjęcia");
    }
  });

  const handleImageUpload = async (name: string, url: string) => {
    try {
      const { error } = await supabase.from('gallery_images').insert([
        {
          gallery_id: galleryId,
          url,
          position: galleryImages?.length || 0
        }
      ]);
      
      if (error) {
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['gallery-images'] });
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success("Zdjęcie dodane");
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error("Nie udało się dodać zdjęcia");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="font-medium text-lg mb-4">Zdjęcia w galerii</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isImagesLoading ? (
            <div>Ładowanie zdjęć...</div>
          ) : galleryImages && galleryImages.length > 0 ? (
            galleryImages.map((image) => (
              <GalleryImageItem
                key={image.id}
                image={image}
                onDelete={(id) => deleteImageMutation.mutate(id)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center p-6 border rounded border-dashed">
              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Ta galeria nie zawiera jeszcze żadnych zdjęć</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Label>Dodaj zdjęcie do galerii</Label>
        <FileUpload
          onSuccess={(name, url) => handleImageUpload(name, url)}
          acceptedFileTypes="image/*"
          bucket="news_images"
          uploadId={`gallery-upload-${galleryId}`}
          compress={true}
          quality={85}
        />
      </div>
    </div>
  );
}
