
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FileUpload } from "../FileUpload";
import { Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { StaticPage } from "@/types/staticPages";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface StaticPageEditorProps {
  existingPage?: StaticPage;
  onSuccess?: () => void;
  defaultSlug?: string;
}

export function StaticPageEditor({ existingPage, onSuccess, defaultSlug }: StaticPageEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showInSidebar, setShowInSidebar] = useState(existingPage?.show_in_sidebar ?? true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (existingPage) {
      setTitle(existingPage.title);
      setContent(existingPage.content);
      setFeaturedImage(existingPage.featured_image || null);
      setShowInSidebar(existingPage.show_in_sidebar ?? true);
    }
  }, [existingPage]);

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!title.trim()) {
        toast.error("Tytuł jest wymagany");
        return;
      }

      if (existingPage?.id) {
        console.log("Updating existing static page:", existingPage.id);
        const { error } = await supabase
          .from('static_pages')
          .update({
            title,
            content,
            featured_image: featuredImage,
            show_in_sidebar: showInSidebar,
          })
          .eq('id', existingPage.id);

        if (error) throw error;
        console.log("Static page updated successfully");
        toast.success("Strona została zaktualizowana");
      } else {
        console.log("Creating new static page");
        const { error } = await supabase.from('static_pages').insert({
          title,
          content,
          featured_image: featuredImage,
          created_by: user?.id,
          slug: defaultSlug,
          show_in_sidebar: showInSidebar,
        });

        if (error) throw error;
        console.log("Static page created successfully");
        toast.success("Strona została zapisana");
      }

      queryClient.invalidateQueries({ queryKey: ['static-pages'] });
      if (!existingPage) {
        setTitle("");
        setContent("");
        setFeaturedImage(null);
        setShowInSidebar(true);
      }
      onSuccess?.();
    } catch (error) {
      console.error("Error saving static page:", error);
      toast.error("Nie udało się zapisać strony");
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
        placeholder="Tytuł strony..."
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
            bucket="static_pages_images"
            onSuccess={handleImageUpload}
            acceptedFileTypes="image/*"
          />
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id="show-in-sidebar"
          checked={showInSidebar}
          onCheckedChange={(checked) => setShowInSidebar(checked as boolean)}
        />
        <Label htmlFor="show-in-sidebar">Pokaż w menu bocznym</Label>
      </div>

      <Editor
        apiKey="vasnexdz0vp8r14mwm4viwjkcvz47fqe7g9rwkdjbmafsxak"
        init={{
          height: 500,
          menubar: true,
          plugins: [
            "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
            "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
            "insertdatetime", "media", "table", "code", "help", "wordcount",
            "paste"
          ],
          toolbar: "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              font-size: 16px;
              margin: 1rem;
            }
            p { margin: 0 0 1rem 0; }
            ul, ol { margin: 0 0 1rem 0; padding-left: 2rem; }
            img { max-width: 100%; height: auto; }
          `,
          formats: {
            alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-left' },
            aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-center' },
            alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-right' },
            alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', classes: 'text-justify' },
          },
          paste_retain_style_properties: "all",
          paste_word_valid_elements: "b,strong,i,em,h1,h2,h3,p,br",
          paste_enable_default_filters: true,
          browser_spellcheck: true,
          cleanup: false,
          verify_html: false,
        }}
        value={content}
        onEditorChange={setContent}
      />
      <Button onClick={handleSubmit} className="mt-4">
        {existingPage ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}

