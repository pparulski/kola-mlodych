import { BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Ebook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  created_at: string;
}

interface EbookCardProps {
  ebook: Ebook;
  onDelete?: (id: string) => void;
  adminMode?: boolean;
}

export function EbookCard({ ebook, onDelete, adminMode = false }: EbookCardProps) {
  return (
    <Card className="w-[300px] h-[250px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg truncate" title={ebook.title}>
          {ebook.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {ebook.cover_url ? (
          <img
            src={ebook.cover_url}
            alt={`Cover of ${ebook.title}`}
            className="w-full h-32 object-contain mb-2"
          />
        ) : (
          <div className="w-full h-32 bg-muted flex items-center justify-center mb-2">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Dodano: {new Date(ebook.created_at).toLocaleDateString("pl-PL")}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <a href={ebook.file_url} target="_blank" rel="noopener noreferrer">
            <BookOpen className="mr-2 h-4 w-4" />
            Czytaj
          </a>
        </Button>
        {adminMode && onDelete && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(ebook.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}