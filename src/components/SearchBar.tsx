
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Debounce search to prevent excessive API calls
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim()) {
      debounceTimeout.current = setTimeout(() => {
        onSearch(query);
      }, 500);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, onSearch]);

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-xl transition-all duration-300 ${
        isFocused 
          ? "shadow-[0_0_0_3px_rgba(0,113,227,0.1)] bg-white" 
          : "bg-secondary hover:bg-secondary/80"
      }`}
    >
      <div className="flex items-center px-4 py-3">
        <Search 
          className={`w-5 h-5 transition-colors duration-300 ${
            isFocused ? "text-primary" : "text-muted-foreground"
          }`} 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for songs..."
          className="w-full bg-transparent border-none outline-none px-3 py-1 text-sm placeholder:text-muted-foreground/70"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isLoading && (
          <div className="w-4 h-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        )}
      </div>
    </div>
  );
};

export default SearchBar;
