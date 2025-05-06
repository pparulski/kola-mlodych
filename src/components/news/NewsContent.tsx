
import { ContentRenderer } from "@/components/content/ContentRenderer";

interface NewsContentProps {
  content: string;
}

export function NewsContent({ content }: NewsContentProps) {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert mt-6">
      <ContentRenderer content={content} />
    </div>
  );
}
