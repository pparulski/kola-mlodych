
import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyNewsListProps {
  onRefresh?: () => void;
}

export function EmptyNewsList({ onRefresh }: EmptyNewsListProps) {
  return (
    <div className="text-center p-8 bg-[hsl(var(--content-box))] rounded-lg border-2 border-border">
      <p className="text-lg font-medium mb-2">Nie znaleziono artykułów spełniających kryteria.</p>
      <p className="text-muted-foreground mb-4">Spróbuj zmienić kryteria wyszukiwania lub kategorii.</p>
      
      {onRefresh && (
        <Button 
          variant="outline" 
          onClick={onRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Odśwież
        </Button>
      )}
    </div>
  );
}
