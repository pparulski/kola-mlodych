import { Editor } from "@tinymce/tinymce-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileUpload } from "./FileUpload";
import { Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NewsEditorProps {
  existingNews?: any;
  onSuccess?: () => void;
  isStaticPage?: boolean;
  defaultSlug?: string;
}

export function NewsEditor({ existingNews, onSuccess, isStaticPage, defaultSlug }: NewsEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (existingNews) {
      setTitle(existingNews.title);
      setContent(existingNews.content);
      setFeaturedImage(existingNews.featured_image);
    }
  }, [existingNews]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  };

  const handleSubmit = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("Session error:", sessionError);
        toast.error("Sesja wygasła. Zaloguj się ponownie.");
        navigate("/auth");
        return;
      }

      const generatedSlug = defaultSlug || generateSlug(title);
      
      // Delete old featured image if it exists and we're uploading a new one
      if (existingNews?.featured_image && featuredImage !== existingNews.featured_image) {
        const oldImagePath = existingNews.featured_image.split('/').pop();
        if (oldImagePath) {
          const { error: deleteError } = await supabase.storage
            .from('news_images')
            .remove([oldImagePath]);
          
          if (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }
      }

      if (existingNews) {
        console.log('Updating existing article:', existingNews.id);
        const { error } = await supabase
          .from('news')
          .update({
            title,
            content,
            featured_image: featuredImage,
            is_static_page: isStaticPage || false,
            slug: generatedSlug,
          })
          .eq('id', existingNews.id);

        if (error) throw error;
        toast.success("Artykuł został zaktualizowany");
      } else {
        console.log('Creating new article');
        const { error } = await supabase.from('news').insert({
          title,
          content,
          featured_image: featuredImage,
          created_by: session.user.id,
          is_static_page: isStaticPage || false,
          slug: generatedSlug,
        });

        if (error) throw error;
        toast.success("Artykuł został zapisany");
      }

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