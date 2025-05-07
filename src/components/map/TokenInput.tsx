
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TokenInputProps {
  mapboxToken: string;
  onTokenSubmit: (token: string) => void;
}

/**
 * Component for inputting and managing Mapbox API token
 */
export const TokenInput = ({ mapboxToken, onTokenSubmit }: TokenInputProps) => {
  const [token, setToken] = useState<string>(mapboxToken);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTokenSubmit(token);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Konfiguracja mapy</CardTitle>
        <CardDescription>
          Aby korzystać z mapy, potrzebny jest token dostępu do Mapbox.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mapbox_token" className="text-sm font-medium">
              Token Mapbox
            </label>
            <Input
              id="mapbox_token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="pk.eyJ1IjoieW91..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Możesz uzyskać token na stronie{" "}
              <a 
                href="https://account.mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox
              </a>
            </p>
          </div>
          <Button type="submit" className="w-full">Zapisz token</Button>
        </form>
      </CardContent>
    </Card>
  );
};
