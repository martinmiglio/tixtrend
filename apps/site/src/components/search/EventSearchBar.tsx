// EventSearchBar.tsx
/* This component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow. */
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@tixtrend/ui/components/input-group";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EventSearchBar = ({
  onSearch,
}: {
  onSearch: (searchTerm: string) => void;
}) => {
  const DEBOUNCE_DURATION = 350; // milliseconds

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DURATION);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
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
                onSearch(searchTerm);
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
