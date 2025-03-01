
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { StaticPage } from "@/types/staticPages";
import { StaticPageImageUpload } from "./StaticPageImageUpload";
import { StaticPageTinyMCE } from "./StaticPageTinyMCE";
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
        className="w-full p-2 border rounded text-black bg-white"
      />

      <StaticPageImageUpload
        featuredImage={featuredImage}
        onImageUpload={(url) => setFeaturedImage(url)}
      />

      <StaticPageSidebarOption
        showInSidebar={showInSidebar}
        setShowInSidebar={setShowInSidebar}
      />

      <StaticPageTinyMCE 
        content={content}
        onEditorChange={setContent}
      />

      <Button 
        onClick={() => handleSubmit([])} 
        className="mt-4"
      >
        {existingPage ? "Zaktualizuj" : "Opublikuj"}
      </Button>
    </div>
  );
}
