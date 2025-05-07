
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardFooter, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Users 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Defining an interface for union data
interface Union {
  id: number;
  name: string;
  bio?: string;
  logo_url?: string;
  year_created?: number;
  contact?: string;
  facebook_url?: string;
  instagram_url?: string;
  region?: string;
  city?: string;
}

const Map = () => {
  const isMobile = useIsMobile();
  const [expandedUnion, setExpandedUnion] = useState<number | null>(null);

  const { data: unions, isLoading } = useQuery({
    queryKey: ['unions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Union[];
    }
  });

  // Group unions by region
  const unionsByRegion = useMemo(() => {
    if (!unions) return {};
    
    return unions.reduce((acc, union) => {
      const region = union.region || 'Inne';
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(union);
      return acc;
    }, {} as Record<string, Union[]>);
  }, [unions]);

  // Get unique regions sorted alphabetically
  const regions = useMemo(() => {
    if (!unionsByRegion) return [];
    return Object.keys(unionsByRegion).sort();
  }, [unionsByRegion]);

  // Toggle expanded state for a union
  const toggleExpand = (unionId: number) => {
    setExpandedUnion(expandedUnion === unionId ? null : unionId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-muted rounded mb-4"></div>
          <div className="grid gap-4 w-full md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Struktury Związku</h1>
        <p className="text-muted-foreground">
          Poznaj koła młodych OZZ Inicjatywy Pracowniczej działające w całej Polsce.
        </p>
      </div>

      <Tabs defaultValue={regions[0] || "all"} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="mb-6">
            {regions.map(region => (
              <TabsTrigger key={region} value={region} className="min-w-20">
                {region}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {regions.map(region => (
          <TabsContent key={region} value={region} className="mt-4">
            <div className={`grid gap-6 ${
              isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {unionsByRegion[region]?.map((union) => (
                <Card 
                  key={union.id} 
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    "hover:shadow-md",
                    expandedUnion === union.id ? "ring-2 ring-primary/20" : ""
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl line-clamp-2">{union.name}</CardTitle>
                        {union.city && (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{union.city}</span>
                          </div>
                        )}
                      </div>
                      
                      {union.logo_url && (
                        <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center">
                          <img 
                            src={union.logo_url} 
                            alt={`Logo ${union.name}`}
                            className="max-h-16 max-w-16 object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-3 pt-2">
                    {union.year_created && (
                      <Badge variant="outline" className="mb-3">
                        <Users className="mr-1 h-3 w-3" />
                        Rok założenia: {union.year_created}
                      </Badge>
                    )}
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="bio" className="border-0">
                        <AccordionTrigger className="py-1 text-sm text-primary hover:no-underline">
                          O organizacji
                        </AccordionTrigger>
                        <AccordionContent>
                          {union.bio ? (
                            <p className="text-sm text-muted-foreground">
                              {union.bio}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Brak szczegółowego opisu.
                            </p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      {union.contact && (
                        <a 
                          href={`mailto:${union.contact}`}
                          className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          title={union.contact}
                        >
                          <Mail className="h-4 w-4" />
                          <span className="hidden md:inline">Kontakt</span>
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {union.facebook_url && (
                        <a 
                          href={union.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
                          title="Facebook"
                        >
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {union.instagram_url && (
                        <a 
                          href={union.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:text-primary transition-colors p-1 rounded-full hover:bg-accent/10"
                          title="Instagram"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Map;
