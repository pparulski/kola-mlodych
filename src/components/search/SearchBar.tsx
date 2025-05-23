
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
  
  // Refs to track state update sources and prevent loops
  const isUpdatingFromParent = useRef(false);
  const isSubmitting = useRef(false);
  const ignoreNextParentUpdate = useRef(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Synchronize from parent state to local state, but avoid loops
  useEffect(() => {
    // Skip if we just submitted a value ourselves
    if (isSubmitting.current) {
      isSubmitting.current = false;
      return;
    }
    
    // Skip if we explicitly want to ignore a parent update
    if (ignoreNextParentUpdate.current) {
      ignoreNextParentUpdate.current = false;
      return;
    }
    
    // Skip if we're already processing an update from parent
    if (isUpdatingFromParent.current) {
      return;
    }
    
    // Only update local state when parent state changes and is different
    if (searchQuery !== inputValue) {
      isUpdatingFromParent.current = true;
      setInputValue(searchQuery);
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUpdatingFromParent.current = false;
      }, 100);
    }
  }, [searchQuery, inputValue]);

  // Handle input changes - only update local state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUpdatingFromParent.current) return;
    
    // We just want to update the local input value, not submit
    setInputValue(e.target.value);

    // Reset the debounce timeout if it exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };

  // Submit search only on Enter key
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  };

  // Submit search to parent component
  const submitSearch = () => {
    // Skip if we're currently processing an update from parent
    if (isUpdatingFromParent.current) return;
    
    // Only update parent state if the value actually changed
    if (inputValue !== searchQuery) {
      console.log(`Submitting search: "${inputValue}"`);
      
      // Set flags to prevent loops
      isSubmitting.current = true;
      ignoreNextParentUpdate.current = true;
      
      // Actually update the parent state
      setSearchQuery(inputValue);
    }
  };

  // Clear search
  const handleClear = () => {
    if (isUpdatingFromParent.current) return;
    
    setInputValue("");
    isSubmitting.current = true;
    ignoreNextParentUpdate.current = true;
    setSearchQuery("");
    
    // Focus input after clearing
    setTimeout(() => {
      if (activeRef.current) {
        activeRef.current.focus({ preventScroll: true });
      }
    }, 50);
  };

  // Submit search when clicking the search icon
  const handleSearchIconClick = () => {
    if (isUpdatingFromParent.current) return;
    submitSearch();
    
    // Focus input after search
    setTimeout(() => {
      if (activeRef.current) {
        activeRef.current.focus({ preventScroll: true });
      }
    }, 50);
  };

  // Submit search on blur with debounce to prevent immediate refreshes
  const handleBlur = () => {
    // Only submit on blur if value has changed and we're not updating from parent
    if (inputValue !== searchQuery && !isUpdatingFromParent.current) {
      // Clear any existing timeout
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      
      // Set a short delay before submitting to prevent rapid submission during focus changes
      debounceTimeout.current = setTimeout(() => {
        submitSearch();
        debounceTimeout.current = null;
      }, 200);
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
        onBlur={handleBlur}
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
