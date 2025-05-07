
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Union {
  id: string;
  name: string;
  description?: string;
  city?: string;
  coordinates?: Coordinates;
  logo_url?: string;
  year_created?: number;
  bio?: string;
  contact?: string;
  facebook_url?: string;
  instagram_url?: string;
}

// Cities coordinates in Poland
export const cityCoordinates: Record<string, Coordinates> = {
  "Warszawa": { lat: 52.2297, lng: 21.0122 },
  "Kraków": { lat: 50.0647, lng: 19.9450 },
  "Wrocław": { lat: 51.1079, lng: 17.0385 },
  "Poznań": { lat: 52.4064, lng: 16.9252 },
  "Gdańsk": { lat: 54.3520, lng: 18.6466 },
  "Szczecin": { lat: 53.4285, lng: 14.5528 },
  "Łódź": { lat: 51.7592, lng: 19.4560 },
  "Katowice": { lat: 50.2649, lng: 19.0238 },
  "Lublin": { lat: 51.2465, lng: 22.5684 },
  "Białystok": { lat: 53.1325, lng: 23.1688 },
  "Rzeszów": { lat: 50.0412, lng: 21.9991 },
  "Bydgoszcz": { lat: 53.1235, lng: 18.0084 },
  "Gdynia": { lat: 54.5189, lng: 18.5305 },
  "Częstochowa": { lat: 50.8118, lng: 19.1203 },
  "Radom": { lat: 51.4027, lng: 21.1471 },
  "Toruń": { lat: 53.0138, lng: 18.5981 },
  "Sosnowiec": { lat: 50.2862, lng: 19.1040 },
  "Kielce": { lat: 50.8660, lng: 20.6286 },
  "Gliwice": { lat: 50.2944, lng: 18.6714 },
  "Olsztyn": { lat: 53.7783, lng: 20.4801 },
  "default": { lat: 52.0693, lng: 19.4803 } // Center of Poland
};

// Poland bounds to restrict the map view
export const POLAND_BOUNDS: [[number, number], [number, number]] = [
  [14.12, 49.00], // Southwest coordinates
  [24.15, 55.03]  // Northeast coordinates
];

// Default map center (center of Poland)
export const POLAND_CENTER = [19.4803, 52.0693];
