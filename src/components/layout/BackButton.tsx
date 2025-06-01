
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <Button 
      variant="outline"
      onClick={onClick}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Wróć
    </Button>
  );
};
