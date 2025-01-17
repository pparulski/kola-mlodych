import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface NewsContentProps {
  title: string;
  content: string;
  date: string;
  featured_image?: string | null;
}

export function NewsContent({ title, content, date, featured_image }: NewsContentProps) {
  const formattedDate = format(new Date(date), "d MMMM yyyy", { locale: pl });

  return (
    <div className="space-y-4">
      {featured_image && (
        <div className="relative w-full h-[300px] overflow-hidden">
          <img
            src={featured_image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{formattedDate}</p>
      <div 
        className="prose prose-lg max-w-none dark:prose-invert [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}