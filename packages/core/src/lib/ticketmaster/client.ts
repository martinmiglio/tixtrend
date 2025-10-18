import { TicketmasterValidationError } from "./errors";
import * as v from "valibot";

/**
 * Client for interacting with the Ticketmaster Discovery API v2
 *
 * Features:
 * - Automatic API key injection
 * - Rate limiting with retry logic (429 responses)
 * - Optional runtime validation with Valibot
 * - Error handling
 */
class TicketMasterClient {
  private baseUrl: URL;

  constructor() {
    this.baseUrl = new URL("https://app.ticketmaster.com/discovery/v2/");
  }

  /**
   * Fetch data from the Ticketmaster API (unvalidated)
   *
   * @param path - API endpoint path (e.g., "events", "events/123")
   * @param params - Optional query parameters (API key is added automatically)
   * @returns Response data as JSON
   * @throws Error if API key is not defined or request fails
   *
   * @example
   * ```ts
   * const data = await TicketMasterClient.fetch("events", { page: "1", size: "20" });
   * ```
   */
  async fetch(
    path: string,
    params?: { [key: string]: string },
  ): Promise<unknown> {
    const apiKey = process.env.TICKETMASTER_API_KEY;

    if (!apiKey) {
      throw new Error("TICKETMASTER_API_KEY is not defined");
    }

    const url = new URL(path, this.baseUrl);
    url.searchParams.set("apikey", apiKey);
    for (const [key, value] of Object.entries(params ?? {})) {
      url.searchParams.set(key, value);
    }
    const response = await fetch(url);

    // Handle rate limiting with automatic retry
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return await this.fetch(path, params);
    }

    if (!response.ok) {
      throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }
    return await response.json();
  }

  /**
   * Fetch and validate data from the Ticketmaster API
   *
   * @param path - API endpoint path (e.g., "events", "events/123")
   * @param schema - Valibot schema to validate response against
   * @param params - Optional query parameters (API key is added automatically)
   * @returns Validated response data
   * @throws TicketmasterValidationError if response doesn't match schema
   * @throws Error if API key is not defined or request fails
   *
   * @example
   * ```ts
   * const data = await TicketMasterClient.fetchValidated(
   *   "events/123",
   *   TicketMasterEventResponseSchema
   * );
   * ```
   */
  async fetchValidated<
    TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  >(
    path: string,
    schema: TSchema,
    params?: { [key: string]: string },
  ): Promise<v.InferOutput<TSchema>> {
    const data = await this.fetch(path, params);

    try {
      return v.parse(schema, data);
    } catch (error) {
      if (error instanceof v.ValiError) {
        const url = new URL(path, this.baseUrl);
        throw new TicketmasterValidationError(error, url.toString());
      }
      throw error;
    }
  }
}

export default new TicketMasterClient();
