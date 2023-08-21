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
    <div className="flex items-center justify-center pb-4">
      <div className="flex w-full max-w-screen-sm items-center rounded-full bg-white py-2">
        <input
          ref={searchInput}
          className="w-full appearance-none border-none bg-transparent px-5 py-1 leading-tight text-slate-800 focus:outline-none"
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
            className="flex-shrink-0 rounded-full bg-transparent px-5 py-1 text-sm text-slate-800 hover:text-slate-700"
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
