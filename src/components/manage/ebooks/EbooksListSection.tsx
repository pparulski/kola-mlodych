
import { BookText } from "lucide-react";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { Ebook } from "@/components/ebooks/types";

interface EbooksListSectionProps {
  ebooks: Ebook[] | null;
  onDelete: (id: string) => void;
  onEdit: (ebook: Ebook) => void;
}

export function EbooksListSection({ ebooks, onDelete, onEdit }: EbooksListSectionProps) {
  return (
    <div>
      <h2 className="text-xl mb-4">Lista publikacji</h2>
      
      {ebooks && ebooks.length > 0 ? (
        <div className="space-y-6">
          {ebooks.map((ebook) => (
            <EbookCard
              key={ebook.id}
              ebook={ebook}
              onDelete={onDelete}
              onEdit={onEdit}
              adminMode={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/20 rounded-md border border-dashed">
          <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Brak publikacji do wyświetlenia</p>
        </div>
      )}
    </div>
  );
}
