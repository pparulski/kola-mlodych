
import { Category } from "@/types/categories";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: CategoryListProps) {
  if (categories.length === 0) {
    return <p>Brak kategorii.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Lista kategorii</h2>
      <div className="grid gap-4">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="flex items-center justify-between p-4 bg-card border rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline">{category.slug}</Badge>
                {category.show_in_menu && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Menu className="h-3 w-3" />
                    <span>W menu</span>
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
