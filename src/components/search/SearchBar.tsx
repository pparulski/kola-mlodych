import { useRef, useEffect, KeyboardEvent, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchQuery: string; // Represents the *last submitted* query from parent
  setSearchQuery: (query: string) => void; // Function to submit a *new* query to parent
  isCompact?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
}

export function SearchBar({
  searchQuery,      // Last submitted query
  setSearchQuery,   // Function to SUBMIT a query
  isCompact = false,
  inputRef,
  className = "",
}: SearchBarProps) {
  const localInputRef = useRef<HTMLInputElement>(null);
  const activeRef = inputRef || localInputRef;

  // Local state reflects exactly what's typed in the input
  const [inputValue, setInputValue] = useState(searchQuery);

  // Update local input value ONLY if the EXTERNAL searchQuery prop changes
  useEffect(() => {
    if (searchQuery !== inputValue) {
       setInputValue(searchQuery);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Update local state on every keystroke
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Submit the search query ONLY on Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      // Only update parent state if the input value is different from the last submitted query
      // This prevents unnecessary updates if user hits Enter multiple times
      if (inputValue !== searchQuery) {
          setSearchQuery(inputValue);
      }
    }
  };

  // Handle explicit clear button click
  const handleClear = () => {
    setInputValue("");       // Clear the visual input
    // Only update parent state if it wasn't already empty
    if (searchQuery !== "") {
        setSearchQuery("");  // Submit an empty query to parent immediately
    }
    activeRef.current?.focus( {preventScroll: true}); // Optional: refocus input
  };

    // Handle clicking the Search icon - submit current input value
    const handleSearchIconClick = () => {
        if (inputValue !== searchQuery) {
            setSearchQuery(inputValue);
        }
        activeRef.current?.focus({ preventScroll: true }); 
    };


  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
        onClick={handleSearchIconClick} // Submit on icon click
      />
      <Input
        type="search"
        placeholder="Szukaj..."
        value={inputValue} // Controlled by local state
        onChange={handleInputChange} // Update local state only
        onKeyDown={handleKeyDown} // Submit on Enter
        className={`pl-8 w-full ${isCompact ? "h-9" : ""}`}
        ref={activeRef}
      />
      {/* Show explicit clear button if there's text in the input */}
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