
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gallery, GalleryFormData } from "@/types/galleries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";

interface GalleryEditorProps {
  gallery: Gallery | null;
  onCancel: () => void;
}

export function GalleryEditor({ gallery, onCancel }: GalleryEditorProps) {
  const [title, setTitle] = useState(gallery?.title || "");
  const [description, setDescription] = useState(gallery?.description || "");
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data: GalleryFormData) => {
      if (gallery) {
        const { error } = await supabase
          .from('article_galleries')
          .update(data)
          .eq('id', gallery.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('article_galleries')
          .insert([data]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success(gallery ? "Galeria zaktualizowana" : "Galeria utworzona");
      onCancel();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{gallery ? "Edytuj galerię" : "Dodaj nową galerię"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nazwa galerii"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opis galerii (opcjonalnie)"
            />
          </div>

          {gallery && (
            <div className="space-y-2">
              <Label>Zdjęcia</Label>
              <FileUpload
                onSuccess={(url) => {
                  // Add image to gallery
                  supabase.from('gallery_images').insert([
                    {
                      gallery_id: gallery.id,
                      url,
                      position: gallery.gallery_images?.length || 0
                    }
                  ]).then(({ error }) => {
                    if (error) {
                      toast.error("Nie udało się dodać zdjęcia");
                      return;
                    }
                    queryClient.invalidateQueries({ queryKey: ['galleries'] });
                    toast.success("Zdjęcie dodane");
                  });
                }}
                acceptedFileTypes="image/*"
                bucket="news_images"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={saveMutation.isPending}>
              {gallery ? "Zapisz zmiany" : "Dodaj galerię"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
