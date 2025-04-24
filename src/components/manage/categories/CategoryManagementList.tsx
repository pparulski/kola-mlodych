
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { CategoryList } from "@/components/manage/CategoryList";
import { LoadingIndicator } from "@/components/home/LoadingIndicator";
import { AlertCircle } from "lucide-react";

interface CategoryManagementListProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryManagementList({ onEdit, onDelete }: CategoryManagementListProps) {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories for management");
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .order("name");
        
        if (error) {
          console.error("Error fetching categories for management:", error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} categories for management`);
        return data as Category[];
      } catch (err) {
        console.error("Exception in categories management fetch:", err);
        throw err;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return <LoadingIndicator type="skeleton" />;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
          <h3 className="font-medium">Błąd podczas ładowania kategorii</h3>
        </div>
        <p className="mt-2 text-sm">
          {error instanceof Error ? error.message : 'Nieznany błąd'}
        </p>
        <p className="mt-2 text-sm">Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.</p>
      </div>
    );
  }

  return <CategoryList 
    categories={categories || []} 
    onEdit={onEdit} 
    onDelete={onDelete} 
  />;
}
