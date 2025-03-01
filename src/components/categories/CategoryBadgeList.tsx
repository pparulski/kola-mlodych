
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
          className="bg-primary/10 hover:bg-primary/20 text-xs px-2 py-1 border-primary/20"
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
