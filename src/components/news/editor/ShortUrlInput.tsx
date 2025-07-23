import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShortUrlInputProps {
  shortUrl: string;
  setShortUrl: (value: string) => void;
}

export function ShortUrlInput({ shortUrl, setShortUrl }: ShortUrlInputProps) {
  const baseUrl = "https://mlodzi.ozzip.pl/";
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any leading slashes and spaces, convert to lowercase
    const value = e.target.value.toLowerCase().replace(/^\/+|^\s+/, '').trim();
    setShortUrl(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="short-url">Krótki URL (opcjonalny)</Label>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {baseUrl}
        </span>
        <Input
          id="short-url"
          type="text"
          value={shortUrl}
          onChange={handleInputChange}
          placeholder="custom-url"
          className="flex-1"
        />
      </div>
      {shortUrl && (
        <p className="text-xs text-muted-foreground">
          Pełny URL: {baseUrl}{shortUrl}
        </p>
      )}
    </div>
  );
}