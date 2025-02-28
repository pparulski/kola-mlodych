
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

interface CategoryFilterButtonProps {
  isOpen: boolean;
  onClick: () => void;
  count: number;
}

export function CategoryFilterButton({ isOpen, onClick, count }: CategoryFilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      <Tag className="h-4 w-4" />
      <span>Filtry</span>
      {count > 0 && (
        <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
          {count}
        </span>
      )}
    </Button>
  );
}
