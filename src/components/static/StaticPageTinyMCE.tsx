
import { Editor } from "@tinymce/tinymce-react";

interface StaticPageTinyMCEProps {
  content: string;
  onEditorChange: (content: string) => void;
}

export function StaticPageTinyMCE({ content, onEditorChange }: StaticPageTinyMCEProps) {
  return (
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
      onEditorChange={onEditorChange}
    />
  );
}
