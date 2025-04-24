
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryList } from "@/components/manage/CategoryList";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryManagementListProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryManagementList({ onEdit, onDelete }: CategoryManagementListProps) {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Category[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return <CategoryList 
    categories={categories || []} 
    onEdit={onEdit} 
    onDelete={onDelete} 
  />;
}
