
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
import { Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface NewsEditorProps {
  existingNews?: any;
  onSuccess?: () => void;
}

export function NewsEditor({ existingNews, onSuccess }: NewsEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingNews) {
      setTitle(existingNews.title);
      setContent(existingNews.content);
      setFeaturedImage(existingNews.featured_image);
    }
  }, [existingNews]);

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      if (existingNews) {
        console.log("Updating existing news:", existingNews.id);
        const { error } = await supabase
          .from('news')
          .update({
            title,
            content,
            featured_image: featuredImage,
          })
          .eq('id', existingNews.id);

        if (error) throw error;
        console.log("News updated successfully");
        toast.success("Artykuł został zaktualizowany");
      } else {
        console.log("Creating new news");
        const { error } = await supabase.from('news').insert({
          title,
          content,
          featured_image: featuredImage,
          created_by: user?.id,
          slug,
        });

        if (error) throw error;
        console.log("News created successfully");
        toast.success("Artykuł został zapisany");
      }

      queryClient.invalidateQueries({ queryKey: ['news'] });
      if (!existingNews) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Nie udało się zapisać artykułu");
    }
  };

  const handleImageUpload = (name: string, url: string) => {
    setFeaturedImage(url);
    setShowImageUpload(false);
    toast.success("Zdjęcie zostało dodane");
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł artykułu..."
        className="w-full p-2 border rounded text-black bg-white"
      />

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
            bucket="news_images"
            onSuccess={handleImageUpload}
            acceptedFileTypes="image/*"
          />
        </div>
      )}

      <Editor
        apiKey="vasnexdz0vp8r14mwm4viwjkcvz47fqe7g9rwkdjbmafsxak"
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "code", "help", "wordcount"
          ],
          toolbar: "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; }",
        }}
        value={content}
        onEditorChange={setContent}
      />
      <Button onClick={handleSubmit} className="mt-4">
        {existingNews ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}
