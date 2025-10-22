/**
 * Ticketmaster URL Translation Service
 *
 * Translates Ticketmaster event URLs to Discovery API event IDs by:
 * 1. Parsing the URL to extract legacy event ID and keywords
 * 2. Searching the Discovery API with those keywords
 * 3. Validating results by comparing URLs to find exact match
 */
import { getEventByKeyword } from "./events";

/**
 * Parsed Ticketmaster URL data
 */
export type ParsedTicketmasterUrl = {
  legacyId: string;
  keywords: string[];
};

/**
 * Common words to filter out from URL slugs
 * These don't help with event searches
 */
const STOP_WORDS = new Set([
  "tour",
  "show",
  "live",
  "concert",
  "event",
  "tickets",
  "ticket",
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
]);

/**
 * Checks if a string is a valid Ticketmaster URL
 *
 * @param input - String to validate
 * @returns True if input is a Ticketmaster URL
 *
 * @example
 * isTicketmasterUrl("https://www.ticketmaster.com/event/123") // true
 * isTicketmasterUrl("bladee concert") // false
 */
export const isTicketmasterUrl = (input: string): boolean => {
  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    return (
      url.hostname.includes("ticketmaster.com") &&
      url.pathname.includes("/event/")
    );
  } catch {
    return false;
  }
};

/**
 * Parse a Ticketmaster URL to extract legacy event ID and search keywords
 *
 * @param url - Ticketmaster event URL
 * @returns Parsed data with legacy ID and keywords, or null if invalid
 *
 * @example
 * parseTicketmasterUrl("https://www.ticketmaster.com/bladee-martyr-tour-phoenix-arizona-10-23-2025/event/19006291DE7F2F8F")
 * // Returns: { legacyId: "19006291DE7F2F8F", keywords: ["bladee", "martyr", "phoenix", "arizona"] }
 */
export const parseTicketmasterUrl = (
  url: string,
): ParsedTicketmasterUrl | null => {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);

    // Extract legacy event ID from /event/{id} segment
    const eventIdMatch = urlObj.pathname.match(/\/event\/([A-F0-9]+)/i);
    if (!eventIdMatch || !eventIdMatch[1]) {
      return null;
    }
    const legacyId = eventIdMatch[1];

    // Extract slug (everything before /event/)
    const slugMatch = urlObj.pathname.match(/\/([^/]+)\/event\//);
    if (!slugMatch || !slugMatch[1]) {
      // If no slug, just return the legacy ID with no keywords
      return { legacyId, keywords: [] };
    }

    // Parse slug into keywords
    const slug = slugMatch[1];
    const rawKeywords = slug
      .split("-")
      .map((word) => word.toLowerCase().trim())
      .filter((word) => word.length > 0);

    // Filter out dates, stop words, and keep meaningful keywords
    const keywords = rawKeywords.filter((word) => {
      // Remove dates (e.g., "10", "23", "2025")
      if (/^\d+$/.test(word)) return false;
      // Remove stop words
      if (STOP_WORDS.has(word)) return false;
      // Remove very short words (likely not useful)
      if (word.length < 2) return false;
      return true;
    });

    return { legacyId, keywords };
  } catch {
    return null;
  }
};

/**
 * Extract legacy event ID from a Ticketmaster URL
 *
 * @param url - Full Ticketmaster URL or just the event ID portion
 * @returns Legacy event ID or null
 *
 * @example
 * extractLegacyId("https://ticketmaster.com/event/19006291DE7F2F8F") // "19006291DE7F2F8F"
 * extractLegacyId("http://ticketmaster.com/event/0E0050681F51BA4C") // "0E0050681F51BA4C"
 */
export const extractLegacyId = (url: string): string | null => {
  const eventIdMatch = url.match(/\/event\/([A-F0-9]+)/i);
  return eventIdMatch?.[1] ?? null;
};

/**
 * Translate a Ticketmaster URL to a Discovery API event ID
 *
 * Algorithm:
 * 1. Parse the URL to get legacy ID and search keywords
 * 2. Search Discovery API with keywords
 * 3. Compare each result's URL to find matching legacy ID
 * 4. Return Discovery API ID if exact match found
 *
 * @param url - Ticketmaster event URL
 * @returns Discovery API event ID or null if not found
 *
 * @example
 * const discoveryId = await translateUrlToDiscoveryId(
 *   "https://www.ticketmaster.com/bladee-martyr-tour-phoenix-arizona-10-23-2025/event/19006291DE7F2F8F"
 * );
 * // Returns: "1A_Zk1oGkdrLwX2" (or null if not found)
 */
export const translateUrlToDiscoveryId = async (
  url: string,
): Promise<string | null> => {
  // Parse the URL
  const parsed = parseTicketmasterUrl(url);
  if (!parsed) {
    return null;
  }

  const { legacyId, keywords } = parsed;

  // If no keywords, we can't search effectively
  if (keywords.length === 0) {
    return null;
  }

  // Search Discovery API with keywords
  // Use top 3-4 most relevant keywords to avoid too broad searches
  const searchQuery = keywords.slice(0, 4).join(" ");

  try {
    // Search with larger page size to increase chances of finding match
    const events = await getEventByKeyword(searchQuery, 0, 20);

    // Find event with matching legacy ID
    for (const event of events) {
      if (!event.url) {
        continue;
      }

      const eventLegacyId = extractLegacyId(event.url);
      if (
        eventLegacyId &&
        eventLegacyId.toLowerCase() === legacyId.toLowerCase()
      ) {
        // Found exact match!
        return event.id;
      }
    }

    // No exact match found
    return null;
  } catch {
    return null;
  }
};
