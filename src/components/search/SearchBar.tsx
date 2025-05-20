
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
  
  // Local state for input value that user sees and types in
  const [inputValue, setInputValue] = useState(searchQuery);
  
  // Flag to track if we're currently processing an update from parent
  const isUpdatingFromParent = useRef(false);
  // Flag to track if we're processing a user input update
  const isProcessingUserInput = useRef(false);

  // Only update local input when parent state changes (but not due to our own updates)
  useEffect(() => {
    if (isUpdatingFromParent.current) {
      return; // Skip if we're already processing an update
    }
    
    // Mark that we're updating from parent to avoid loops
    isUpdatingFromParent.current = true;
    
    // Update local input value to match parent state
    setInputValue(searchQuery);
    
    // Reset the flag after a short delay to allow rendering to complete
    setTimeout(() => {
      isUpdatingFromParent.current = false;
    }, 50);
  }, [searchQuery]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUpdatingFromParent.current) return; // Skip if currently updating from parent
    
    isProcessingUserInput.current = true;
    setInputValue(e.target.value);
    isProcessingUserInput.current = false;
  };

  // Submit search only on Enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      submitSearch();
    }
  };

  // Submit search to parent component
  const submitSearch = () => {
    if (inputValue !== searchQuery && !isUpdatingFromParent.current) {
      setSearchQuery(inputValue);
    }
  };

  // Clear search
  const handleClear = () => {
    if (isUpdatingFromParent.current) return;
    
    setInputValue("");
    setSearchQuery("");
    
    setTimeout(() => {
      activeRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  // Submit search when clicking the search icon
  const handleSearchIconClick = () => {
    if (!isUpdatingFromParent.current) {
      submitSearch();
      setTimeout(() => {
        activeRef.current?.focus({ preventScroll: true }); 
      }, 50);
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
