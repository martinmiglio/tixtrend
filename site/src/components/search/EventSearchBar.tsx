// EventSearchBar.tsx
/* This component is used to search for events by keywords.
This will be used in the home page of the site to begin the flow. */
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  }, [debouncedSearchTerm]);

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
    <div className="flex justify-center items-center pb-4">
      <div className="w-full max-w-screen-sm flex items-center py-2 rounded-full bg-white">
        <input
          ref={searchInput}
          className="appearance-none bg-transparent border-none w-full text-slate-800 py-1 px-5 leading-tight focus:outline-none"
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
          <button
            className="flex-shrink-0 bg-transparent text-slate-800 hover:text-slate-700 text-sm py-1 px-5 rounded-full"
            type="button"
            onClick={clearSearch}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EventSearchBar;
