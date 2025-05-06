
interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  if (!title) return null;
  
  return (
    <div className="flex flex-col">
      <h1 className="text-3xl md:text-4xl font-bold text-primary inline-flex items-baseline">
        {title}
      </h1>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  );
}
