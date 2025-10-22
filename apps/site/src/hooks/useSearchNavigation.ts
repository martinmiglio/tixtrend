import { Route } from "@/app/index";
import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Custom hook for managing search navigation state via URL params
 * Provides type-safe helpers for reading and updating search parameters
 */
export function useSearchNavigation() {
  const navigate = useNavigate({ from: "/" });
  const search = Route.useSearch();

  const setPage = useCallback(
    (page: number) => {
      navigate({
        search: (prev) => ({
          ...prev,
          page,
        }),
      });
    },
    [navigate],
  );

  const setKeyword = useCallback(
    (keyword: string) => {
      navigate({
        search: {
          keyword,
          page: 1, // Reset to page 1 when keyword changes
        },
      });
    },
    [navigate],
  );

  const reset = useCallback(() => {
    navigate({
      search: {
        keyword: "",
        page: 1,
      },
    });
  }, [navigate]);

  return {
    keyword: search.keyword,
    page: search.page,
    setPage,
    setKeyword,
    reset,
  };
}
