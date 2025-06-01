
import { Button } from "../ui/button";
import { StaticPage } from "@/types/staticPages";
import { RichTextEditor } from "@/components/news/editor/RichTextEditor";
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
    content,
    setContent,
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
        className="w-full p-2 border rounded text-black bg-white"
      />

      <StaticPageSidebarOption
        showInSidebar={showInSidebar}
        setShowInSidebar={setShowInSidebar}
      />

      <RichTextEditor
        value={content}
        onEditorChange={setContent}
        height={500}
        menubar={true}
      />

      <Button
        onClick={() => handleSubmit()}
        className="mt-4"
      >
        {existingPage ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}
