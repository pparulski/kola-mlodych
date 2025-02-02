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
        className="prose prose-lg max-w-none dark:prose-invert text-foreground break-words"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}