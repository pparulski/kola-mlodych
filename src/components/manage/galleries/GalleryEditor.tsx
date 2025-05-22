
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gallery, GalleryFormData, GalleryImage } from "@/types/galleries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, X, Image as ImageIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useFormattedFilename } from "@/hooks/useFormattedFilename";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GalleryEditorProps {
  gallery: Gallery | null;
  onCancel: () => void;
}

// Extract this into a separate component to avoid calling hooks in a loop
function GalleryImageItem({ image, onDelete }: { 
  image: GalleryImage; 
  onDelete: (id: string) => void;
}) {
  const getFileNameFromUrl = (url: string): string => {
    try {
      const parts = new URL(url).pathname.split('/');
      return parts[parts.length - 1];
    } catch (e) {
      return "Unknown file";
    }
  };
  
  const getFileFormat = (url: string): string => {
    try {
      const fileName = getFileNameFromUrl(url);
      const parts = fileName.split('.');
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'Unknown';
    } catch (e) {
      return "Unknown";
    }
  };

  const filename = getFileNameFromUrl(image.url);
  const { displayText, isTruncated } = useFormattedFilename({
    filename,
    maxLength: 25, 
  });

  return (
    <div className="flex items-center justify-between border rounded p-3 bg-white dark:bg-zinc-800">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-gray-100 dark:bg-zinc-700 rounded flex-shrink-0 overflow-hidden">
          <img 
            src={image.url} 
            alt="" 
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = ''; 
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const icon = document.createElement('div');
                icon.className = 'flex items-center justify-center h-full w-full';
                icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                parent.appendChild(icon);
              }
            }}
          />
        </div>
        <div className="overflow-hidden max-w-[calc(100%-80px)]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm font-medium truncate" title={filename}>
                  {displayText}
                </div>
              </TooltipTrigger>
              {isTruncated && (
                <TooltipContent>
                  <p>{filename}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className="text-xs text-muted-foreground">
            Format: {getFileFormat(image.url)}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (confirm('Czy na pewno chcesz usunąć to zdjęcie z galerii?')) {
            onDelete(image.id);
          }
        }}
        className="text-destructive hover:bg-destructive/10 ml-2 flex-shrink-0"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Usuń zdjęcie</span>
      </Button>
    </div>
  );
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

            <Separator className="my-6" />

            <div className="mt-4">
              <h3 className="font-medium text-lg mb-4">Zdjęcia w galerii</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {imagesLoading ? (
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
                  uploadId={`gallery-upload-${gallery?.id || newGallery?.id}`}
                  compress={true}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
