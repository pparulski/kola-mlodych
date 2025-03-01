
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { StaticPage } from "@/types/staticPages";

interface StaticPageListItemProps {
  page: StaticPage;
  onEdit: (page: StaticPage) => void;
  onDelete: (pageId: string) => void;
}

export function StaticPageListItem({
  page,
  onEdit,
  onDelete,
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
        </div>
      </div>
      <div className="flex items-center gap-2">
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
