
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/categories";

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  category: Category | null;
  usageCount: number;
}

export function CategoryDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  category,
  usageCount,
}: CategoryDeleteDialogProps) {
  if (!category) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usunąć kategorię "{category.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {usageCount > 0 ? (
              <>
                Ta kategoria jest używana w <strong>{usageCount}</strong>{" "}
                {usageCount === 1 ? "artykule" : "artykułach"}.
                <br />
                Usunięcie jej może wpłynąć na wyświetlanie tych artykułów.
              </>
            ) : (
              "Ta operacja jest nieodwracalna."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
