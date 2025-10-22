// EventSearchBar.tsx
/* This component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow. */
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@tixtrend/ui/components/input-group";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EventSearchBar = () => {
  const { keyword, setKeyword, reset } = useSearchNavigation();

  const [searchTerm, setSearchTerm] = useState(keyword);
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // Sync local state with URL param on mount
  useEffect(() => {
    setSearchTerm(keyword);
  }, [keyword]);

  // Update URL when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== keyword) {
      setKeyword(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, keyword, setKeyword]);

  const clearSearch = () => {
    setSearchTerm("");
    reset();
  };

  const searchInput = useCallback((instance: HTMLInputElement | null) => {
    if (instance) {
      instance.focus();
    }
  }, []);

  return (
    <div className="flex items-center justify-center pb-4">
      <div className="max-w-screen-sm flex flex-grow">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInput}
            type="text"
            placeholder="Search for an event"
            aria-label="Search for an event"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setKeyword(searchTerm);
              }
            }}
          />
          {searchTerm.length > 0 && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={clearSearch} variant="ghost">
                <X className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
    </div>
  );
};

export default EventSearchBar;
