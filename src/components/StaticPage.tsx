
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StaticPageEditor } from "./static/StaticPageEditor";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { StaticPage as StaticPageType } from "@/types/staticPages";

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
      if (!slug) return null;
      console.log("Fetching static page:", slug);
      const { data, error } = await supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      console.log("Static page data:", data);
      return data as StaticPageType;
    },
    enabled: !!slug
  });

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
        <StaticPageEditor
          existingPage={page}
          onSuccess={() => {
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['static-page', slug] });
            queryClient.invalidateQueries({ queryKey: ['static-pages-sidebar'] });
            toast.success("Strona została zaktualizowana");
          }}
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
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            Edytuj stronę
          </Button>
        )}
        
        {page ? (
          <div 
            className="prose prose-lg max-w-none dark:prose-invert mt-4 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ol]:list-decimal [&>ol]:pl-6 [&>img]:rounded-lg [&>img]:w-full [&>img]:h-auto"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center text-muted-foreground mt-4">
            {isAdmin ? (
              <p>Ta strona nie została jeszcze utworzona.</p>
            ) : (
              "Ta strona jest w trakcie tworzenia."
            )}
          </div>
        )}
      </div>
    </div>
  );
}
