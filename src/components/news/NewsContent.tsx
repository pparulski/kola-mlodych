
interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content }: NewsContentProps) {
  return (
    <div 
      className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>p]:mb-3 md:[&>p]:mb-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
