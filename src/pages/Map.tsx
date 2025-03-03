import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Facebook, Instagram } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Map = () => {
  const isMobile = useIsMobile();
  
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
    <div className="container mx-auto px-4 py-6">
      <div className={`grid gap-6 ${
        isMobile 
          ? 'grid-cols-1' 
          : 'grid-cols-1'
      }`}>
        {unions?.map((union) => (
          <Card 
            key={union.id} 
            className="p-6 bg-[rgb(174,174,183)] dark:bg-[rgb(51,51,51)]"
          >
            <div className={`flex ${isMobile ? 'flex-col' : 'flex-row gap-8'}`}>
              {/* Left section with logo, name, and contact info */}
              <div className={`${isMobile ? 'w-full' : 'w-1/2'} flex flex-col items-center`}>
                <h3 className="font-bold text-lg mb-4 text-center">{union.name}</h3>
                
                {union.logo_url && (
                  <div className="mb-4 flex-shrink-0">
                    <img 
                      src={union.logo_url} 
                      alt={`Logo ${union.name}`}
                      className="h-24 w-auto mx-auto object-contain"
                    />
                  </div>
                )}

                <div className="mt-auto text-center">
                  <p className="text-sm mb-4">Rok założenia: {union.year_created}</p>
                  
                  <div className="flex flex-col items-center gap-2">
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
                </div>
              </div>

              {/* Right section with bio */}
              <div className={`${isMobile ? 'w-full mt-4' : 'w-1/2 flex items-center'}`}>
                {union.bio && (
                  <p className="text-sm text-muted-foreground">
                    {union.bio}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Map;
