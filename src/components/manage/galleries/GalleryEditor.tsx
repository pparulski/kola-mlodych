
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GalleryEditorProps {
  gallery: Gallery | null;
  onCancel: () => void;
}

export function GalleryEditor({ gallery, onCancel }: GalleryEditorProps) {
  const [title, setTitle] = useState(gallery?.title || "");
  const [description, setDescription] = useState(gallery?.description || "");
  const [newGallery, setNewGallery] = useState<Gallery | null>(null);
  const queryClient = useQueryClient();

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

  const handleImageUpload = async (name: string, url: string) => {
    const galleryId = gallery?.id || newGallery?.id;
    
    if (!galleryId) {
      toast.error("Najpierw zapisz galerię, aby dodać zdjęcia");
      return;
    }

    try {
      const { error } = await supabase.from('gallery_images').insert([
        {
          gallery_id: galleryId,
          url,
          position: gallery?.gallery_images?.length || newGallery?.gallery_images?.length || 0
        }
      ]);
      
      if (error) {
        throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast.success("Zdjęcie dodane");
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error("Nie udało się dodać zdjęcia");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{gallery || newGallery ? "Edytuj galerię" : "Dodaj nową galerię"}</CardTitle>
      </CardHeader>
      <CardContent>
        {!gallery && !newGallery ? (
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

            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 my-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Po utworzeniu galerii będzie można dodać do niej zdjęcia.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                Dodaj galerię
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Anuluj
              </Button>
            </div>
          </form>
        ) : (
          <>
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

              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending}>
                  Zapisz zmiany
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Anuluj
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t pt-6">
              <div className="space-y-2">
                <Label>Dodaj zdjęcie do galerii</Label>
                <FileUpload
                  onSuccess={(name, url) => handleImageUpload(name, url)}
                  acceptedFileTypes="image/*"
                  bucket="news_images"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
