// EventSearchBar.tsx
/* This component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow. */
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { findEventByUrl } from "@/server/event-functions";
import { useNavigate } from "@tanstack/react-router";
import { isTicketmasterUrl } from "@tixtrend/core";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@tixtrend/ui/components/input-group";
import { Search, X, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EventSearchBar = () => {
  const { keyword, setKeyword, reset } = useSearchNavigation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState(keyword);
  const [isUrlSearching, setIsUrlSearching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
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
    setUrlError(null);
    reset();
  };

  const handleUrlSearch = async (url: string) => {
    setIsUrlSearching(true);
    setUrlError(null);

    try {
      const event = await findEventByUrl({ data: { url } });
      if (event) {
        // Navigate to event detail page
        navigate({ to: "/event/$eventid", params: { eventid: event.id } });
      } else {
        setUrlError("Event not found for this URL");
      }
    } catch (error) {
      setUrlError(
        error instanceof Error ? error.message : "Failed to find event",
      );
    } finally {
      setIsUrlSearching(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm) return;

    // Check if input is a Ticketmaster URL
    if (isTicketmasterUrl(searchTerm)) {
      handleUrlSearch(searchTerm);
    } else {
      // Regular keyword search
      setKeyword(searchTerm);
    }
  };

  const searchInput = useCallback((instance: HTMLInputElement | null) => {
    if (instance) {
      instance.focus();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pb-4">
      <div className="max-w-screen-sm flex flex-grow w-full">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            {isUrlSearching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInput}
            type="text"
            placeholder="Search for an event or paste Ticketmaster URL"
            aria-label="Search for an event or paste Ticketmaster URL"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setUrlError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            disabled={isUrlSearching}
          />
          {searchTerm.length > 0 && !isUrlSearching && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={clearSearch} variant="ghost">
                <X className="size-4" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>
      {urlError && (
        <div className="text-sm text-red-500 mt-2 max-w-screen-sm w-full">
          {urlError}
        </div>
      )}
    </div>
  );
};

export default EventSearchBar;
