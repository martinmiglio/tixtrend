import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { getEventsForPolling } from "../get-events-for-polling";

vi.mock("sst", () => ({
  Resource: {
    EventPollFailuresTable: { name: "failures-table" },
    WatchedEventsTable: { name: "watched-table" },
  },
}));

vi.mock("../../../lib/aws/dynamo", () => ({
  scanWatchedEvents: vi.fn(),
}));

vi.mock("../../../lib/ticketmaster/events", () => ({
  fetchEventIdsByPage: vi.fn(),
  fetchEventIdsByPageSorted: vi.fn(),
}));

vi.mock("../../prices/track-failures", () => ({
  shouldSkipEvent: vi.fn(),
}));

import { scanWatchedEvents } from "../../../lib/aws/dynamo";
import {
  fetchEventIdsByPage,
  fetchEventIdsByPageSorted,
} from "../../../lib/ticketmaster/events";
import { shouldSkipEvent } from "../../prices/track-failures";

const mockScanWatchedEvents = scanWatchedEvents as Mock;
const mockFetchEventIdsByPage = fetchEventIdsByPage as Mock;
const mockFetchEventIdsByPageSorted = fetchEventIdsByPageSorted as Mock;
const mockShouldSkipEvent = shouldSkipEvent as Mock;

beforeEach(() => {
  vi.clearAllMocks();
  // Replace setTimeout with an instant version to avoid delays in collectPopularEvents/collectSaleSoonEvents
  vi.spyOn(globalThis, "setTimeout").mockImplementation((fn: Function) => {
    fn();
    return 0 as unknown as NodeJS.Timeout;
  });
  mockShouldSkipEvent.mockResolvedValue(false);
  mockFetchEventIdsByPage.mockResolvedValue([]);
  mockFetchEventIdsByPageSorted.mockResolvedValue([]);
  mockScanWatchedEvents.mockResolvedValue([]);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getEventsForPolling", () => {
  it("returns empty result when watchlist is empty and Ticketmaster returns nothing", async () => {
    mockScanWatchedEvents.mockResolvedValue([]);
    mockFetchEventIdsByPage.mockResolvedValue([]);
    mockFetchEventIdsByPageSorted.mockResolvedValue([]);

    const result = await getEventsForPolling();

    expect(result.eventIds).toEqual([]);
    expect(result.stats).toEqual({
      watchList: 0,
      popular: 0,
      saleSoon: 0,
      skipped: 0,
      total: 0,
    });
  });

  it("returns watchlist events in stats.watchList count", async () => {
    mockScanWatchedEvents.mockResolvedValue([
      { event_id: "w1" },
      { event_id: "w2" },
      { event_id: "w3" },
    ]);

    const result = await getEventsForPolling();

    expect(result.stats.watchList).toBe(3);
    expect(result.eventIds).toContain("w1");
    expect(result.eventIds).toContain("w2");
    expect(result.eventIds).toContain("w3");
  });

  it("skips events where shouldSkipEvent returns true, increments stats.skipped", async () => {
    mockScanWatchedEvents.mockResolvedValue([
      { event_id: "w1" },
      { event_id: "w2" },
      { event_id: "w3" },
    ]);
    mockShouldSkipEvent.mockImplementation(async (id: string) => id === "w2");

    const result = await getEventsForPolling();

    expect(result.eventIds).toContain("w1");
    expect(result.eventIds).toContain("w3");
    expect(result.eventIds).not.toContain("w2");
    expect(result.stats.skipped).toBeGreaterThanOrEqual(1);
    expect(result.stats.watchList).toBe(2);
  });

  it("limits watchlist to MAX_EVENTS (4000) if it exceeds that", async () => {
    const items = Array.from({ length: 4500 }, (_, i) => ({
      event_id: `w${i}`,
    }));
    mockScanWatchedEvents.mockResolvedValue(items);

    const result = await getEventsForPolling();

    expect(result.stats.watchList).toBeLessThanOrEqual(4000);
    expect(result.eventIds.length).toBeLessThanOrEqual(4000);
  });

  it("fills remaining capacity with popular events", async () => {
    mockScanWatchedEvents.mockResolvedValue([
      { event_id: "w1" },
    ]);
    mockFetchEventIdsByPage.mockResolvedValue(["p1", "p2"]);

    const result = await getEventsForPolling();

    expect(result.stats.watchList).toBe(1);
    expect(result.stats.popular).toBeGreaterThan(0);
    expect(result.eventIds).toContain("w1");
    expect(result.eventIds).toContain("p1");
  });

  it("does not deduplicate events across categories", async () => {
    // The implementation does NOT deduplicate between categories.
    // If the same event appears in both popular and on-sale-soon, both are included.
    const watchItems = Array.from({ length: 3990 }, (_, i) => ({
      event_id: `w${i}`,
    }));
    mockScanWatchedEvents.mockResolvedValue(watchItems);
    // With 3990 watched events, remaining capacity is 10 for popular
    // Popular returns "shared1" on first page
    mockFetchEventIdsByPage.mockResolvedValueOnce(["shared1", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"]).mockResolvedValue([]);
    // saleSoon has 0 remaining capacity, so it won't be called meaningfully
    mockFetchEventIdsByPageSorted.mockResolvedValueOnce(["shared1", "s1"]).mockResolvedValue([]);

    const result = await getEventsForPolling();

    // popular fills the remaining 10 slots
    expect(result.stats.popular).toBe(10);
    // saleSoon gets 0 remaining
    expect(result.stats.saleSoon).toBe(0);
    expect(result.stats.total).toBe(
      result.stats.watchList + result.stats.popular + result.stats.saleSoon,
    );
  });

  it("stats.total equals eventIds.length", async () => {
    mockScanWatchedEvents.mockResolvedValue([
      { event_id: "w1" },
      { event_id: "w2" },
    ]);
    mockFetchEventIdsByPage.mockResolvedValue(["p1", "p2", "p3"]);
    mockFetchEventIdsByPageSorted.mockResolvedValue(["s1"]);

    const result = await getEventsForPolling();

    expect(result.stats.total).toBe(result.eventIds.length);
  });

  it("stats reflect correct counts per category", async () => {
    mockScanWatchedEvents.mockResolvedValue([
      { event_id: "w1" },
      { event_id: "w2" },
    ]);
    // Return data only on first page, empty on subsequent
    mockFetchEventIdsByPage.mockResolvedValueOnce(["p1", "p2", "p3"]).mockResolvedValue([]);
    mockFetchEventIdsByPageSorted.mockResolvedValueOnce(["s1", "s2"]).mockResolvedValue([]);

    // Skip one popular event
    mockShouldSkipEvent.mockImplementation(async (id: string) => id === "p2");

    const result = await getEventsForPolling();

    expect(result.stats.watchList).toBe(2);
    // popular count should exclude the skipped "p2"
    expect(result.eventIds).not.toContain("p2");
    expect(result.stats.popular).toBe(2); // p1, p3 (p2 skipped)
    expect(result.stats.saleSoon).toBe(2); // s1, s2
    expect(result.stats.skipped).toBeGreaterThanOrEqual(1);
    expect(result.stats.total).toBe(result.eventIds.length);
    expect(result.stats.total).toBe(
      result.stats.watchList + result.stats.popular + result.stats.saleSoon,
    );
  });
});
