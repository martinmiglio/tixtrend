import EventInfoItem from "../event/EventInfoItem";
import EventSearchBar from "./EventSearchBar";
import EventSearchErrorBoundary from "./EventSearchErrorBoundary";
import EventSearchSkeleton from "./EventSearchSkeleton";
import { useEventSearch } from "@/hooks/useEventSearch";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { Link } from "@tanstack/react-router";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tixtrend/ui/components/pagination";
import { Suspense } from "react";

/**
 * Inner component that uses Suspense-enabled hooks
 * This component will suspend while data is loading
 */
function EventSearchResults() {
  const { keyword, page, setPage } = useSearchNavigation();
  const { data } = useEventSearch({ keyword, page });
  const { events, hasMore, currentPage } = data;

  if (events.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No events found. Try a different search term.
      </p>
    );
  }

  // Calculate pagination
  const totalPages = hasMore ? currentPage + 1 : currentPage;
  const showPagination = events.length > 0 && (hasMore || currentPage > 1);

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page if we know there are more
      if (hasMore && currentPage < totalPages) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="w-full">
      <div className="space-y-2">
        {events.map((eventData) => (
          <div className="my-2" key={eventData.id}>
            <Link to={`/event/$eventid`} params={{ eventid: eventData.id }}>
              <EventInfoItem eventData={eventData} />
            </Link>
          </div>
        ))}
      </div>

      {showPagination && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      setPage(currentPage - 1);
                    }
                  }}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum) =>
                pageNum === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${pageNum}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (hasMore) {
                      setPage(currentPage + 1);
                    }
                  }}
                  aria-disabled={!hasMore}
                  className={
                    !hasMore
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

/**
 * Main EventSearch component with Suspense and Error boundaries
 * Replaces infinite scroll with paginated results
 */
const EventSearch = () => {
  const { keyword } = useSearchNavigation();

  return (
    <div className="w-full">
      <EventSearchBar />
      {keyword.length > 0 && (
        <EventSearchErrorBoundary>
          <Suspense fallback={<EventSearchSkeleton />}>
            <EventSearchResults />
          </Suspense>
        </EventSearchErrorBoundary>
      )}
    </div>
  );
};

export default EventSearch;
