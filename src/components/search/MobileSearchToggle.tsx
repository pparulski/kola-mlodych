
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileSearchToggleProps {
  isOpen: boolean;
  toggleSearch: () => void;
}

export function MobileSearchToggle({ isOpen, toggleSearch }: MobileSearchToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="md:hidden"
      onClick={toggleSearch}
      aria-label={isOpen ? "Close search" : "Open search"}
    >
      {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
    </Button>
  );
}
