import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram } from "lucide-react";
import { useState } from "react";

interface UnionLocation {
  id: number;
  name: string;
  address: string;
  contact: string;
  yearCreated: number;
  facebook_url?: string;
  instagram_url?: string;
}

const exampleLocations: UnionLocation[] = [
  {
    id: 1,
    name: "Koło Młodych Centralne",
    address: "ul. Uniwersytecka 123, Warszawa",
    contact: "kontakt@kolo.org",
    yearCreated: 1990,
    facebook_url: "https://facebook.com/koloCentral",
    instagram_url: "https://instagram.com/koloCentral"
  },
  {
    id: 2,
    name: "Koło Młodych Pracowników",
    address: "ul. Akademicka 456, Kraków",
    contact: "kmp@kolo.org",
    yearCreated: 2005,
    facebook_url: "https://facebook.com/koloKrakow",
    instagram_url: "https://instagram.com/koloKrakow"
  },
];

const Map = () => {
  const [locations] = useState<UnionLocation[]>(exampleLocations);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">Lista Kół Młodych</h1>
      <Card className="p-4">
        <div className="space-y-4">
          <Input
            placeholder="Szukaj koła..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <ScrollArea className="h-[520px]">
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <Card key={location.id} className="p-4 hover:bg-accent/50">
                  <h3 className="font-bold">{location.name}</h3>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                  <p className="text-sm">Rok założenia: {location.yearCreated}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm text-accent"
                      onClick={() => window.location.href = `mailto:${location.contact}`}
                    >
                      {location.contact}
                    </Button>
                    <div className="flex gap-2">
                      {location.facebook_url && (
                        <a
                          href={location.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                      {location.instagram_url && (
                        <a
                          href={location.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </Card>
    </div>
  );
};

export default Map;