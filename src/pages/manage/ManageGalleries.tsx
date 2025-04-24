
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GalleryList } from "@/components/manage/galleries/GalleryList";
import { GalleryEditor } from "@/components/manage/galleries/GalleryEditor";
import { Gallery } from "@/types/galleries";
import { toast } from "sonner";

export function ManageGalleries() {
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_galleries')
        .select('*, gallery_images(*)');
      
      if (error) {
        toast.error("Failed to load galleries");
        throw error;
      }
      
      return data as Gallery[];
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Zarządzaj galeriami</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <GalleryEditor
            gallery={editingGallery}
            onCancel={() => setEditingGallery(null)}
          />
        </div>
        
        <div>
          <GalleryList
            galleries={galleries || []}
            onEdit={setEditingGallery}
          />
        </div>
      </div>
    </div>
  );
}
