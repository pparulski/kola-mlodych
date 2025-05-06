
interface PageTitleProps {
  title: string;
  description?: string;
}

export function PageTitle({ title, description }: PageTitleProps) {
  if (!title) return null;
  
  return (
    <div className="flex flex-col items-start">
      <h1 className="text-3xl md:text-4xl font-bold text-primary inline-flex">
        {title}
      </h1>
      {description && <p className="text-muted-foreground ml-[44px] md:ml-0">{description}</p>}
    </div>
  );
}
