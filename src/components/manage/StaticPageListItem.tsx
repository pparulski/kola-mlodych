
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { StaticPage } from "@/types/staticPages";
import { UseMutationResult } from "@tanstack/react-query";

interface StaticPageListItemProps {
  page: StaticPage;
  position: number;
  totalPages: number;
  onEdit: (page: StaticPage) => void;
  onDelete: (pageId: string) => void;
  updatePositionMutation: UseMutationResult<void, Error, { pageId: string; direction: 'up' | 'down' }>;
}

export function StaticPageListItem({
  page,
  position,
  totalPages,
  onEdit,
  onDelete,
  updatePositionMutation
}: StaticPageListItemProps) {
  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div className="flex-1">
        <h2 className="font-semibold">{page.title}</h2>
        <p className="text-sm text-muted-foreground">/{page.slug}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            {page.show_in_sidebar ? "Widoczna w menu" : "Ukryta w menu"}
          </span>
          {page.show_in_sidebar && (
            <span className="text-sm text-muted-foreground">
              (Pozycja: {position + 1})
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {page.show_in_sidebar && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => updatePositionMutation.mutate({ pageId: page.id, direction: 'up' })}
              disabled={position === 0}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => updatePositionMutation.mutate({ pageId: page.id, direction: 'down' })}
              disabled={position === totalPages - 1}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Button
          variant="outline"
          onClick={() => onEdit(page)}
        >
          Edytuj
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(page.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
