
import React from "react";

export function EmptyNewsList() {
  return (
    <div className="text-center p-8 bg-card rounded-lg border-2 border-border">
      <p className="text-lg font-medium mb-2">Nie znaleziono artykułów spełniających kryteria.</p>
      <p className="text-muted-foreground">Spróbuj zmienić kryteria wyszukiwania lub kategorii.</p>
    </div>
  );
}
