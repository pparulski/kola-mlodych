
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaticPageListItem } from "./StaticPageListItem";
import type { StaticPage } from "@/types/staticPages";
import { UseMutationResult } from "@tanstack/react-query";

interface StaticPageListProps {
  pages: StaticPage[];
  onCreateNew: () => void;
  onEdit: (page: StaticPage) => void;
  onDelete: (pageId: string) => void;
  updatePositionMutation: UseMutationResult<void, Error, { pageId: string; direction: 'up' | 'down' }>;
}

export function StaticPageList({
  pages,
  onCreateNew,
  onEdit,
  onDelete,
  updatePositionMutation
}: StaticPageListProps) {
  const visibleInSidebar = pages
    .filter(page => page.show_in_sidebar)
    .sort((a, b) => (a.sidebar_position || 0) - (b.sidebar_position || 0));

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
            position={page.show_in_sidebar ? visibleInSidebar.findIndex(p => p.id === page.id) : -1}
            totalPages={visibleInSidebar.length}
            onEdit={onEdit}
            onDelete={onDelete}
            updatePositionMutation={updatePositionMutation}
          />
        ))}
      </div>
    </div>
  );
}
