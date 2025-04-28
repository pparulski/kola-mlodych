// StaticPageEditor.tsx

import { Button } from "../ui/button";
// Removed useState as it wasn't used directly here
import { StaticPage } from "@/types/staticPages";
import { StaticPageImageUpload } from "./StaticPageImageUpload";
// --- REMOVE OLD IMPORT ---
// import { StaticPageTinyMCE } from "./StaticPageTinyMCE";
// --- ADD NEW IMPORT ---
import { RichTextEditor } from "@/components/news/editor/RichTextEditor"; // Adjust path
import { StaticPageSidebarOption } from "./StaticPageSidebarOption";
import { usePageSubmit } from "@/hooks/usePageSubmit";

interface StaticPageEditorProps {
  existingPage?: StaticPage;
  onSuccess?: () => void;
  defaultSlug?: string;
}

export function StaticPageEditor({
  existingPage,
  onSuccess,
  defaultSlug
}: StaticPageEditorProps) {
  const {
    title,
    setTitle,
    content, // This holds the editor value
    setContent, // This is the callback for the editor
    featuredImage,
    setFeaturedImage,
    showInSidebar,
    setShowInSidebar,
    handleSubmit
  } = usePageSubmit(existingPage, onSuccess, defaultSlug);

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł strony..."
        className="w-full p-2 border rounded text-black bg-white" // Consider styling consistency
      />

      <StaticPageImageUpload
        featuredImage={featuredImage}
        onImageUpload={(url) => setFeaturedImage(url)}
      />

      <StaticPageSidebarOption
        showInSidebar={showInSidebar}
        setShowInSidebar={setShowInSidebar}
      />

      {/* --- REPLACE USAGE --- */}
      <RichTextEditor
        value={content} // Pass the current content
        onEditorChange={setContent} // Pass the state update function
        // --- Provide specific overrides if needed ---
        height={500}
        menubar={true}
        // You could also pass a more complex init object here if needed:
        // init={{ menubar: true, height: 500, /* other overrides */ }}
      />

      <Button
        onClick={() => handleSubmit([])} // Assuming handleSubmit expects categories (empty here?)
        className="mt-4"
      >
        {existingPage ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}