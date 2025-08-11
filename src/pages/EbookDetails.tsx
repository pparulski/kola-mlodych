import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Ebook } from "@/components/ebooks/types";
import { SEO } from "@/components/seo/SEO";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { slugify } from "@/utils/slugUtils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function EbookDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchEbook = async () => {
      if (!slug) return;
      // 1) Try by stored slug
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .eq("slug", slug)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching ebook by slug:", error);
      }

      if (active && data) {
        setEbook(data as Ebook);
        setNotFound(false);
        return;
      }

      // 2) Fallback: fetch all and match by computed slug from title (to support legacy rows without slug)
      const { data: all, error: allErr } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });
      if (allErr) {
        console.error("Error fetching all ebooks for fallback:", allErr);
      }

      if (active && all) {
        const matched = (all as Ebook[]).find((e) => slugify(e.title) === slug);
        if (matched) {
          setEbook(matched);
          setNotFound(false);
          return;
        }
      }

      if (active) setNotFound(true);
    };

    fetchEbook();
    return () => { active = false; };
  }, [slug]);

  if (notFound) {
    return (
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nie znaleziono!</AlertDialogTitle>
            <AlertDialogDescription>
              Nie możemy znaleźć takiej publikacji. Być może została usunięta albo link jest nieprawidłowy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogAction asChild>
              <Link to="/ebooks">Przeglądaj publikacje</Link>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (!ebook) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-lg animate-pulse">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <SEO
        title={ebook.title}
        description={ebook.description}
        image={ebook.cover_url}
        article={{}}
      />

      {/* Reuse the same card layout; show type and page count */}
      <EbookCard 
        ebook={ebook} 
        adminMode={false} 
        showType={true} 
        showDetails={true} 
        showMoreButton={false} 
        truncateDescription={false}
        isDetailsPage={true}
      />
    </div>
  );
}
