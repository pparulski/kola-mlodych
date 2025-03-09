
import { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCompact?: boolean;
  isOpen?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  isCompact = false,
  isOpen = true,
  inputRef,
  className = "",
}: SearchBarProps) {
  // Use provided ref or create a new one
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeRef = inputRef || localInputRef;
  
  // Focus the search input when opened
  useEffect(() => {
    if (isOpen && activeRef.current) {
      activeRef.current.focus();
    }
  }, [isOpen, activeRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Szukaj..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`pl-8 w-full ${isCompact ? "h-9" : ""}`}
        ref={activeRef}
      />
    </div>
  );
}
