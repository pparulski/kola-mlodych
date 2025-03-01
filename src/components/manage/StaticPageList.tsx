
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticPageListItem } from "./StaticPageListItem";
import type { StaticPage } from "@/types/staticPages";

interface StaticPageListProps {
  pages: StaticPage[];
  onCreateNew: () => void;
  onEdit: (page: StaticPage) => void;
  onDelete: (pageId: string) => void;
}

export function StaticPageList({
  pages,
  onCreateNew,
  onEdit,
  onDelete
}: StaticPageListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Zarządzaj stronami</h1>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj nową stronę
        </Button>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <StaticPageListItem
            key={page.id}
            page={page}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
