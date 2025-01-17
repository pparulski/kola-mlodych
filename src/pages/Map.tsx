import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Facebook, Instagram } from "lucide-react";

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
              <h3 className="font-bold text-lg mb-4">{union.name}</h3>
              
              {union.logo_url && (
                <div className="mb-4">
                  <img 
                    src={union.logo_url} 
                    alt={`Logo ${union.name}`}
                    className="h-24 w-auto mx-auto object-contain"
                  />
                </div>
              )}

              <p className="text-sm mb-4">Rok założenia: {union.year_created}</p>
              
              <div className="flex flex-col gap-2">
                {union.contact && (
                  <a 
                    href={`mailto:${union.contact}`}
                    className="text-sm text-accent hover:underline"
                  >
                    {union.contact}
                  </a>
                )}
                <div className="flex justify-center gap-4 mt-2">
                  {union.facebook_url && (
                    <a 
                      href={union.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-primary transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {union.instagram_url && (
                    <a 
                      href={union.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Map;