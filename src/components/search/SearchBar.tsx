import React, { useRef, useEffect, KeyboardEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string; // This is the "source of truth" from the parent (e.g., from URL)
  setSearchQuery: (query: string) => void; // Function to update the parent's source of truth
  isCompact?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SearchBar({
  searchQuery: parentSearchQuery, // Rename prop for clarity internally
  setSearchQuery: setParentSearchQuery,
  isCompact = false,
  inputRef,
  className = "",
}: SearchBarProps) {
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeRef = inputRef || localInputRef;

  // inputValue is what the user is currently typing.
  // It's initialized from parentSearchQuery but then becomes independent until submission.
  const [inputValue, setInputValue] = useState(parentSearchQuery);

  // Ref to track the previous value of parentSearchQuery to detect external changes.
  const prevParentSearchQueryRef = useRef(parentSearchQuery);

  // Effect to update inputValue ONLY when parentSearchQuery changes externally
  // (e.g., URL change via back/forward, filters cleared by parent).
  // This should NOT run just because the parent re-rendered with the same parentSearchQuery.
  useEffect(() => {
    // If the parentSearchQuery prop has actually changed its value since the last render,
    // and it's different from what the user is currently typing, then update.
    // This handles external resets or changes to the search term.
    if (parentSearchQuery !== prevParentSearchQueryRef.current) {
      // console.log(`SearchBar: parentSearchQuery prop changed from "${prevParentSearchQueryRef.current}" to "${parentSearchQuery}". Current inputValue: "${inputValue}"`);
      if (parentSearchQuery !== inputValue) {
        // console.log(`SearchBar: Syncing inputValue to new parentSearchQuery: "${parentSearchQuery}"`);
        setInputValue(parentSearchQuery);
      }
    }
    // Always update the ref to the current prop value for the next comparison.
    prevParentSearchQueryRef.current = parentSearchQuery;
  }, [parentSearchQuery, inputValue]); // Re-run if parentSearchQuery or local inputValue changes to re-evaluate sync

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(`SearchBar: User typed, new inputValue: "${e.target.value}"`);
    setInputValue(e.target.value); // Only update local state while typing
  };

  const submitSearch = () => {
    // console.log(`SearchBar: Attempting to submit search. inputValue: "${inputValue}", parentSearchQuery: "${parentSearchQuery}"`);
    // Only call parent's setSearchQuery if the current input value
    // is different from what the parent already thinks the query is.
    // This prevents unnecessary updates if user hits enter on an unchanged query.
    if (inputValue !== parentSearchQuery) {
      // console.log(`SearchBar: Submitting to parent: "${inputValue}"`);
      setParentSearchQuery(inputValue);
    }
    // Note: After setParentSearchQuery is called, the parentSearchQuery prop
    // will eventually update, and the useEffect above will sync prevParentSearchQueryRef.current.
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  };

  const handleClear = () => {
    // console.log("SearchBar: Clearing search.");
    setInputValue("");        // Clear visual input immediately
    setParentSearchQuery(""); // Submit empty query to parent immediately
    
    // Refocus after a tick to ensure input is visible if it was part of a conditional render
    setTimeout(() => {
      activeRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  const handleSearchIconClick = () => {
    // console.log("SearchBar: Search icon clicked.");
    submitSearch();
    setTimeout(() => {
      activeRef.current?.focus({ preventScroll: true });
    }, 0); // Refocus after submission
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
        onClick={handleSearchIconClick}
        aria-label="Submit search"
      />
      <Input
        type="search"
        placeholder="Szukaj..."
        value={inputValue} // Controlled by local state
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        // Removed onBlur submission as it can be premature if user is tabbing.
        // Submission should be explicit (Enter or click Search icon).
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