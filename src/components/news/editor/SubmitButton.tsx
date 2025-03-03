
import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
  isEditing: boolean;
}

export function SubmitButton({ 
  isSubmitting, 
  onClick, 
  isEditing 
}: SubmitButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isSubmitting}
      className="w-full"
    >
      {isSubmitting
        ? "Zapisywanie..."
        : isEditing
          ? "Zaktualizuj artykuł"
          : "Dodaj artykuł"}
    </Button>
  );
}
