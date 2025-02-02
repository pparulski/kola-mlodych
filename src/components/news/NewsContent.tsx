import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface NewsContentProps {
  title: string;
  content: string;
  date: string;
  featured_image?: string;
}

export function NewsContent({ title, content, date, featured_image }: NewsContentProps) {
  const formattedDate = format(new Date(date), "d MMMM yyyy", { locale: pl });

  return (
    <article className="space-y-4 w-full max-w-4xl mx-auto overflow-hidden">
      {featured_image && (
        <div className="relative w-full h-[300px] overflow-hidden rounded-lg">
          <img
            src={featured_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground break-words">{title}</h1>
      <p className="text-sm text-foreground">{formattedDate}</p>
      <div 
        className="prose prose-lg max-w-none dark:prose-invert text-foreground break-words [&>p]:mb-4 [&>p]:mt-0 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg [&>h1]:text-3xl [&>h2]:text-2xl [&>h3]:text-xl [&>h4]:text-lg [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>hr]:my-8 [&>hr]:border-border"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}