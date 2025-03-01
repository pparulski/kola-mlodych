
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/categories";

interface CategoryBadgeListProps {
  categories: Category[];
  className?: string;
}

export function CategoryBadgeList({ categories, className = "" }: CategoryBadgeListProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <Badge 
          key={category.id} 
          variant="outline" 
          className="bg-primary/30 dark:bg-primary hover:bg-primary/40 dark:hover:bg-primary/90 
                    text-xs px-2 py-1 border border-primary/50 dark:border-primary/70 
                    font-medium text-foreground dark:text-white"
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
