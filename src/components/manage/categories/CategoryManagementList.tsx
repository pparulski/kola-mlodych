
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryList } from "@/components/manage/CategoryList";
import { LoadingIndicator } from "@/components/home/LoadingIndicator";

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
    return <LoadingIndicator type="skeleton" />;
  }

  return <CategoryList 
    categories={categories || []} 
    onEdit={onEdit} 
    onDelete={onDelete} 
  />;
}
