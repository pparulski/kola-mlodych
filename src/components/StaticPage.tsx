import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewsEditor } from "./NewsEditor";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";

export function StaticPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin', { 
          user_id: session.user.id 
        });
        setIsAdmin(!!isAdmin);
      }
    };

    checkAdminStatus();
  }, []);

  const { data: page, isLoading } = useQuery({
    queryKey: ['static-page', slug],
    queryFn: async () => {
      console.log("Fetching static page:", slug);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_static_page', true)
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      console.log("Static page data:", data);
      return data;
    }
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      
      toast.success("Strona została usunięta");
      navigate('/');
    } catch (error) {
      console.error("Error deleting page:", error);
      toast.error("Nie udało się usunąć strony");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (isEditing && isAdmin) {
    return (
      <div className="space-y-4">
        {isAdmin && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Anuluj edycję
          </Button>
        )}
        <NewsEditor
          existingNews={page}
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['static-page', slug] });
            toast.success("Strona została zaktualizowana");
          }}
          isStaticPage={true}
          defaultSlug={slug}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {page?.featured_image && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${page.featured_image})`,
            opacity: 0.15,
          }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      
      <div className="relative space-y-4">
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="gap-2 hover:text-primary-foreground hover:bg-primary"
            >
              <Pencil className="h-4 w-4" />
              Edytuj stronę
            </Button>
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Usuń stronę
            </Button>
          </div>
        )}
        
        {page ? (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mt-4"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center text-muted-foreground mt-4">
            {isAdmin ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="hover:text-primary-foreground hover:bg-primary"
              >
                Kliknij tutaj aby utworzyć stronę
              </Button>
            ) : (
              "Ta strona jest w trakcie tworzenia."
            )}
          </div>
        )}
      </div>
    </div>
  );
}