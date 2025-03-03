
interface NewsContentProps {
  content: string;
  title?: string;
  date?: string;
  featured_image?: string;
}

export function NewsContent({ content, title, date, featured_image }: NewsContentProps) {
  const formattedDate = date ? new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : null;

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
      {title && <h1 className="text-2xl md:text-3xl font-bold text-foreground break-words">{title}</h1>}
      {formattedDate && <p className="text-sm text-foreground">{formattedDate}</p>}
      <div 
        className="prose prose-sm md:prose-base max-w-none dark:prose-invert text-foreground break-words overflow-hidden [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:w-full [&>img]:h-auto [&>img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}
