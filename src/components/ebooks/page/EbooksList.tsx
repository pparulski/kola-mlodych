
import { BookText } from "lucide-react";
import { EbookCard } from "@/components/ebooks/EbookCard";
import { Ebook } from "@/components/ebooks/types";

interface EbooksListProps {
  ebooks: Ebook[];
  onDelete?: (id: string) => void;
  onEdit?: (ebook: Ebook) => void;
  adminMode?: boolean;
  showType?: boolean;
}

export function EbooksList({ ebooks, onDelete, onEdit, adminMode = false, showType = false }: EbooksListProps) {
  if (ebooks.length === 0) {
    return <EbooksEmptyState adminMode={adminMode} />;
  }

  return (
    <div className="space-y-6">
      {ebooks.map((ebook) => (
        <EbookCard
          key={ebook.id}
          ebook={ebook}
          onDelete={onDelete}
          onEdit={onEdit}
          adminMode={adminMode}
          showType={showType}
          showMoreButton={!adminMode}
          truncateDescription={!adminMode}
        />
      ))}
    </div>
  );
}

interface EbooksEmptyStateProps {
  adminMode: boolean;
}

function EbooksEmptyState({ adminMode }: EbooksEmptyStateProps) {
  return (
    <div className="text-center py-12 bg-muted/20 rounded-md border border-dashed animate-fade-in">
      <BookText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">Brak publikacji</h3>
      <p className="text-muted-foreground">
        {adminMode 
          ? "Kliknij przycisk 'Dodaj publikację', aby dodać nową pozycję." 
          : "W tej chwili nie ma żadnych publikacji do wyświetlenia."}
      </p>
    </div>
  );
}
