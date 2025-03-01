
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/categories";

interface CategoryBadgeListProps {
  categories: Category[];
  className?: string;
}

export function CategoryBadgeList({ categories, className = "" }: CategoryBadgeListProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
      {categories.map((category) => (
        <Badge 
          key={category.id} 
          variant="secondary" 
          className="text-xs px-2 py-1"
        >
          {category.name}
        </Badge>
      ))}
    </div>
  );
}
