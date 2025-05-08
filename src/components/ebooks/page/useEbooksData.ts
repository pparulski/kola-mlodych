
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ebook } from "@/components/ebooks/types";

export function useEbooksData() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEbooks = async () => {
    try {
      console.log("Fetching ebooks...");
      const { data, error } = await supabase
        .from("ebooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log("Ebooks fetched:", data);
      setEbooks(data || []);
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      toast.error("Nie udało się pobrać publikacji");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEbooks();
  }, []);

  return {
    ebooks,
    isLoading,
    fetchEbooks
  };
}
