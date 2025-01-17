import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const Map = () => {
  const { data: unions, isLoading } = useQuery({
    queryKey: ['unions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Koła Młodych</h1>
      
      {isLoading ? (
        <div>Ładowanie...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unions?.map((union) => (
            <Card key={union.id} className="p-4 hover:bg-accent/10 transition-colors">
              <h3 className="font-bold text-lg mb-2">{union.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{union.address}</p>
              <p className="text-sm mb-2">Rok założenia: {union.year_created}</p>
              <div className="space-y-2">
                {union.contact && (
                  <a 
                    href={`mailto:${union.contact}`}
                    className="text-sm text-accent hover:underline block"
                  >
                    {union.contact}
                  </a>
                )}
                {union.facebook_url && (
                  <a 
                    href={union.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline block"
                  >
                    Facebook
                  </a>
                )}
                {union.instagram_url && (
                  <a 
                    href={union.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-accent hover:underline block"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Map;