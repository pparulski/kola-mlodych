import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import L from "leaflet";
import { ScrollArea } from "./ui/scroll-area";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface UnionLocation {
  id: number;
  name: string;
  address: string;
  contact: string;
  yearCreated: number;
  coordinates: [number, number];
}

const exampleLocations: UnionLocation[] = [
  {
    id: 1,
    name: "Student Union Central",
    address: "123 University Ave",
    contact: "contact@union.org",
    yearCreated: 1990,
    coordinates: [51.505, -0.09],
  },
  {
    id: 2,
    name: "Workers Student Alliance",
    address: "456 College Street",
    contact: "wsa@union.org",
    yearCreated: 2005,
    coordinates: [51.51, -0.1],
  },
];

export function UnionsMap() {
  const [locations] = useState<UnionLocation[]>(exampleLocations);
  const [searchTerm, setSearchTerm] = useState("");
  const [map, setMap] = useState<L.Map | null>(null);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (map) {
      console.log("Map instance updated:", map);
      map.setView([51.505, -0.09], 13);
    }
  }, [map]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <MapContainer
            style={{ height: "600px" }}
            className="rounded-lg shadow-lg"
            ref={setMap}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location) => (
              <Marker key={location.id} position={location.coordinates}>
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{location.name}</h3>
                    <p>{location.address}</p>
                    <p>Contact: {location.contact}</p>
                    <p>Founded: {location.yearCreated}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <div>
          <Card className="p-4">
            <div className="space-y-4">
              <Input
                placeholder="Search unions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <ScrollArea className="h-[520px]">
                <div className="space-y-4">
                  {filteredLocations.map((location) => (
                    <Card key={location.id} className="p-4 hover:bg-accent/50 cursor-pointer">
                      <h3 className="font-bold">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                      <p className="text-sm">Founded: {location.yearCreated}</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm text-accent"
                        onClick={() => window.location.href = `mailto:${location.contact}`}
                      >
                        {location.contact}
                      </Button>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}