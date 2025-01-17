import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NewsEditor } from "./NewsEditor";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

export function StaticPage() {
  const { slug } = useParams();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Ładowanie...</div>
      </div>
    );
  }

  const pageTitle = {
    'jowita': 'Jowita',
    'kamionka': 'Kamionka',
    'stolowki': 'Stołówki',
  }[slug || ''] || 'Strona statyczna';

  if (isEditing && isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          <Button
            variant="outline"
            onClick={() => setIsEditing(false)}
          >
            Anuluj edycję
          </Button>
        </div>
        <NewsEditor
          existingNews={page}
          onSuccess={() => {
            setIsEditing(false);
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
      
      <div className="relative max-w-4xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">{pageTitle}</h1>
          {isAdmin && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="gap-2 hover:text-accent"
            >
              <Pencil className="h-4 w-4" />
              Edytuj stronę
            </Button>
          )}
        </div>
        
        {page ? (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center text-muted-foreground">
            {isAdmin ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="hover:text-accent"
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