
/**
 * Types for map components
 */

// Interface for latitude/longitude coordinates for union locations
export interface Coordinates {
  lat: number;
  lng: number;
}

// Interface for union data
export interface Union {
  id: string;
  name: string;
  bio?: string | null;
  logo_url?: string | null;
  year_created?: number;
  contact?: string;
  facebook_url?: string | null;
  instagram_url?: string | null;
  region?: string | null;
  city?: string | null;
  created_at?: string;
  coordinates?: Coordinates;
}

// Record of city coordinates
export const cityCoordinates: Record<string, Coordinates> = {
  "Warszawa": { lat: 52.2297, lng: 21.0122 },
  "Kraków": { lat: 50.0647, lng: 19.9450 },
  "Łódź": { lat: 51.7592, lng: 19.4560 },
  "Wrocław": { lat: 51.1079, lng: 17.0385 },
  "Poznań": { lat: 52.4064, lng: 16.9252 },
  "Gdańsk": { lat: 54.3520, lng: 18.6466 },
  "Katowice": { lat: 50.2649, lng: 19.0238 },
  "Szczecin": { lat: 53.4285, lng: 14.5528 },
  "Lublin": { lat: 51.2465, lng: 22.5684 },
  "Białystok": { lat: 53.1325, lng: 23.1688 },
  "Toruń": { lat: 53.0137, lng: 18.5981 },
  "Rzeszów": { lat: 50.0412, lng: 21.9991 },
  "Olsztyn": { lat: 53.7784, lng: 20.4801 },
  "Bydgoszcz": { lat: 53.1235, lng: 18.0084 },
  "Częstochowa": { lat: 50.8118, lng: 19.1203 },
  "Zielona Góra": { lat: 51.9356, lng: 15.5062 },
  "Gdynia": { lat: 54.5189, lng: 18.5305 },
  "Płock": { lat: 52.5468, lng: 19.7064 },
  "Kielce": { lat: 50.8661, lng: 20.6286 },
  // Default coordinates for cities not in the list
  "default": { lat: 52.0693, lng: 19.4803 } // Center of Poland
};
