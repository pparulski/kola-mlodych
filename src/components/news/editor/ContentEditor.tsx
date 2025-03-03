
import { Editor } from "@tinymce/tinymce-react";
import { Label } from "@/components/ui/label";

interface ContentEditorProps {
  content: string;
  onEditorChange: (content: string) => void;
}

export function ContentEditor({ content, onEditorChange }: ContentEditorProps) {
  return (
    <div>
      <Label htmlFor="content">Treść</Label>
      <Editor
        apiKey="vasnexdz0vp8r14mwm4viwjkcvz47fqe7g9rwkdjbmafsxak"
        value={content}
        onEditorChange={onEditorChange}
        init={{
          height: 400,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      />
    </div>
  );
}
