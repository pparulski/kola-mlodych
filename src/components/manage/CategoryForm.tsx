
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/categories";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/utils/slugUtils";

interface CategoryFormProps {
  editingCategory: Category | null;
  onSuccess?: () => void;
}

export function CategoryForm({ editingCategory, onSuccess }: CategoryFormProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory]);

  const upsertMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string; id?: string }) => {
      if (data.id) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({ name: data.name, slug: data.slug })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({ name: data.name, slug: data.slug });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName("");
      toast.success(editingCategory ? "Kategoria zaktualizowana" : "Kategoria dodana");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error saving category:", error);
      toast.error("Nie udało się zapisać kategorii");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nazwa kategorii jest wymagana");
      return;
    }

    const slug = slugify(name);
    upsertMutation.mutate({
      name: name.trim(),
      slug,
      id: editingCategory?.id
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingCategory ? "Edytuj kategorię" : "Dodaj nową kategorię"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Nazwa kategorii"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? "Zapisywanie..." : (editingCategory ? "Aktualizuj" : "Dodaj")}
            </Button>
            {editingCategory && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onSuccess?.()}
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
