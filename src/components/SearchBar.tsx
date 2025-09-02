import { useState, useCallback, useMemo, useRef } from "react";
import { Search, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar = ({ onSearch, placeholder = "Search for any tool..." }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search to optimize performance
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, 300);
  }, [onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleSearch = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearch(searchQuery);
  }, [searchQuery, onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const handleClear = useCallback(() => {
    setSearchQuery("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-primary rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
        <div className="relative flex items-center bg-card border border-border rounded-xl overflow-hidden shadow-card">
          <div className="flex items-center pl-4 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 bg-transparent px-4 py-6 text-lg placeholder:text-muted-foreground focus-visible:ring-0"
            autoComplete="off"
          />
          {searchQuery && (
            <Button
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="mr-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={handleSearch}
            size="lg"
            className="m-2 bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;