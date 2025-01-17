import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface NewsAdminControlsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function NewsAdminControls({ onEdit, onDelete }: NewsAdminControlsProps) {
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onEdit}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}