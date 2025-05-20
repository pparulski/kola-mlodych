
import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCompact?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  isCompact = false,
  inputRef,
  className = "",
}: SearchBarProps) {
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeRef = inputRef || localInputRef;
  
  // Track if we're processing an update to prevent loops
  const processingUpdate = useRef(false);

  // Local state reflects exactly what's typed in the input
  const [inputValue, setInputValue] = useState(searchQuery);

  // Update local input value ONLY if the EXTERNAL searchQuery prop changes
  // and we're not currently processing a user-initiated update
  useEffect(() => {
    if (!processingUpdate.current && searchQuery !== inputValue) {
      setInputValue(searchQuery);
    }
  }, [searchQuery, inputValue]);

  // Update local state on every keystroke
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Submit the search query ONLY on Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      submitSearch();
    }
  };

  // Submit search helper function with added protection against update loops
  const submitSearch = () => {
    // Only update parent state if the input value is different from the last submitted query
    if (inputValue !== searchQuery) {
      processingUpdate.current = true;
      setSearchQuery(inputValue);
      // Reset the flag after a short delay to allow state updates to propagate
      setTimeout(() => {
        processingUpdate.current = false;
      }, 100);
    }
  };

  // Handle explicit clear button click with protection against update loops
  const handleClear = () => {
    // Only clear if there's something to clear
    if (!processingUpdate.current && inputValue !== "") {
      setInputValue("");
      processingUpdate.current = true;
      setSearchQuery("");
      
      setTimeout(() => {
        processingUpdate.current = false;
        // Focus after state updates are complete
        activeRef.current?.focus({ preventScroll: true });
      }, 100);
    } else {
      // Just focus if nothing to clear
      activeRef.current?.focus({ preventScroll: true });
    }
  };

  // Handle clicking the Search icon - submit current input value
  const handleSearchIconClick = () => {
    if (!processingUpdate.current) {
      submitSearch();
      setTimeout(() => {
        activeRef.current?.focus({ preventScroll: true }); 
      }, 100);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
        onClick={handleSearchIconClick}
      />
      <Input
        type="search"
        placeholder="Szukaj..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={`pl-8 w-full ${isCompact ? "h-9" : ""}`}
        ref={activeRef}
      />
      {inputValue && (
        <X
          className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
          onClick={handleClear}
          aria-label="Clear search"
        />
      )}
    </div>
  );
}
