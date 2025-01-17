import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { NewsEditor } from "@/components/NewsEditor";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface IndexProps {
  adminMode?: boolean;
}

const Index = ({ adminMode = false }: IndexProps) => {
  const [showEditor, setShowEditor] = useState(false);

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Aktualności</h1>
        {adminMode && (
          <Button onClick={() => setShowEditor(!showEditor)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {showEditor ? "Anuluj" : "Dodaj artykuł"}
          </Button>
        )}
      </div>
      
      {showEditor && adminMode && (
        <div className="mb-8">
          <NewsEditor />
        </div>
      )}

      <div className="space-y-4">
        {newsItems?.map((item) => (
          <NewsCard 
            key={item.id} 
            {...item} 
            date={new Date(item.created_at).toLocaleDateString("pl-PL")}
          />
        ))}
      </div>

      {(!newsItems || newsItems.length === 0) && (
        <div className="text-center text-muted-foreground mt-8">
          Brak aktualności
        </div>
      )}
    </div>
  );
};

export default Index;