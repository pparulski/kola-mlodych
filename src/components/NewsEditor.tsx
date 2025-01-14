import { Editor } from "@tinymce/tinymce-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "./ui/use-toast";

export function NewsEditor() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    // Here you would typically send this to your backend
    console.log({ title, content });
    toast({
      title: "Sukces",
      description: "Artykuł został zapisany",
    });
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tytuł artykułu..."
        className="w-full p-2 border rounded"
      />
      <Editor
        apiKey="your-api-key-here" // You'll need to get this from TinyMCE
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
        Opublikuj
      </Button>
    </div>
  );
}