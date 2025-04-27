
import { useRef, useEffect, KeyboardEvent, useState } from "react";
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
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Update input value when searchQuery changes (e.g. from URL)
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Handle Enter key to trigger search
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setSearchQuery(inputValue);
    }
  };
  
  // Handle search button click
  const handleSearchClick = () => {
    setSearchQuery(inputValue);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <Search 
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer" 
        onClick={handleSearchClick}
      />
      <Input
        type="search"
        placeholder="Szukaj..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`pl-8 w-full ${isCompact ? "h-9" : ""}`}
        ref={activeRef}
      />
    </div>
  );
}
