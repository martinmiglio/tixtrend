import { findEvent } from "@/server/event-functions";
import { useSuspenseQuery } from "@tanstack/react-query";

const PAGE_SIZE = 5;

interface UseEventSearchParams {
  keyword: string;
  page: number;
}

/**
 * Custom hook for searching events with pagination support
 * Uses TanStack Query with Suspense for declarative loading states
 */
export function useEventSearch({ keyword, page }: UseEventSearchParams) {
  const query = useSuspenseQuery({
    queryKey: ["events", keyword, page],
    queryFn: async () => {
      if (!keyword || keyword.length === 0) {
        return {
          events: [],
          hasMore: false,
          currentPage: page,
          pageSize: PAGE_SIZE,
        };
      }

      // Page is 1-indexed in URL, but 0-indexed in API
      const events = await findEvent({ data: { keyword, page: page - 1 } });

      return {
        events,
        hasMore: events.length === PAGE_SIZE,
        currentPage: page,
        pageSize: PAGE_SIZE,
      };
    },
    staleTime: 1000 * 30,
  });

  return query;
}
