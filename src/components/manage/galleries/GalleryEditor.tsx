
import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gallery, GalleryFormData, GalleryImage } from "@/types/galleries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { GalleryForm } from "./GalleryForm";
import { GalleryImagesManager } from "./GalleryImagesManager";

interface GalleryEditorProps {
  gallery: Gallery | null;
  onCancel: () => void;
}

export function GalleryEditor({ gallery, onCancel }: GalleryEditorProps) {
  const [title, setTitle] = useState(gallery?.title || "");
  const [description, setDescription] = useState(gallery?.description || "");
  const [newGallery, setNewGallery] = useState<Gallery | null>(null);
  const queryClient = useQueryClient();

  // Get gallery images if editing an existing gallery
  const { data: galleryImages, isLoading: imagesLoading } = useQuery({
    queryKey: ['gallery-images', gallery?.id || newGallery?.id],
    queryFn: async () => {
      const galleryId = gallery?.id || newGallery?.id;
      if (!galleryId) return [];

      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as GalleryImage[];
    },
    enabled: !!(gallery?.id || newGallery?.id),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: GalleryFormData) => {
      if (gallery) {
        const { error } = await supabase
          .from('article_galleries')
          .update(data)
          .eq('id', gallery.id);

        if (error) throw error;
        return gallery;
      } else {
        const { data: newGallery, error } = await supabase
          .from('article_galleries')
          .insert([data])
          .select();

        if (error) throw error;
        return newGallery[0];
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success(gallery ? "Galeria zaktualizowana" : "Galeria utworzona");
      if (!gallery && data) {
        setNewGallery(data as Gallery);
      } else {
        onCancel();
      }
    },
    onError: (error) => {
      console.error('Error saving gallery:', error);
      toast.error("Nie udało się zapisać galerii");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ title, description });
  };

  const currentGallery = gallery || newGallery;
  const isEditing = !!currentGallery;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edytuj galerię" : "Dodaj nową galerię"}</CardTitle>
      </CardHeader>
      <CardContent>
        <GalleryForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          isSubmitting={saveMutation.isPending}
          isEditing={isEditing}
          showCreateWarning={!isEditing}
        />

        {isEditing && (
          <>
            <Separator className="my-6" />
            <GalleryImagesManager
              galleryId={currentGallery.id}
              galleryImages={galleryImages}
              isImagesLoading={imagesLoading}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
