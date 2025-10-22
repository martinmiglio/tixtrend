import { TicketmasterValidationError } from "./errors";
import * as v from "valibot";

/**
 * Validation mode for API responses
 * - STRICT: Throw errors on validation failures (default)
 * - SOFT: Log warnings but continue with best-effort data parsing
 */
export type ValidationMode = "STRICT" | "SOFT";

/**
 * Client for interacting with the Ticketmaster Discovery API v2
 *
 * Features:
 * - Automatic API key injection
 * - Rate limiting with retry logic (429 responses)
 * - Runtime validation with Valibot (strict or soft mode)
 * - Error handling
 *
 * Validation Modes:
 * - STRICT (default): Throws TicketmasterValidationError on schema mismatch
 * - SOFT: Logs warnings and continues with partial data
 *
 * Set validation mode via TICKETMASTER_VALIDATION_MODE environment variable.
 */
class TicketMasterClient {
  private baseUrl: URL;
  private validationMode: ValidationMode;

  constructor() {
    this.baseUrl = new URL("https://app.ticketmaster.com/discovery/v2/");

    // Read validation mode from environment, default to STRICT
    const envMode = process.env.TICKETMASTER_VALIDATION_MODE?.toUpperCase();
    this.validationMode =
      envMode === "SOFT" || envMode === "STRICT"
        ? (envMode as ValidationMode)
        : "STRICT";
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
   * Respects the configured validation mode (STRICT or SOFT).
   * Use fetchValidatedStrict() or fetchValidatedSoft() to explicitly
   * override the configured mode.
   *
   * @param path - API endpoint path (e.g., "events", "events/123")
   * @param schema - Valibot schema to validate response against
   * @param params - Optional query parameters (API key is added automatically)
   * @returns Validated response data
   * @throws TicketmasterValidationError if validation fails in STRICT mode
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
    if (this.validationMode === "SOFT") {
      return this.fetchValidatedSoft(path, schema, params);
    }
    return this.fetchValidatedStrict(path, schema, params);
  }

  /**
   * Fetch and validate data from the Ticketmaster API (strict mode)
   *
   * Always throws on validation failures, regardless of configured mode.
   *
   * @param path - API endpoint path (e.g., "events", "events/123")
   * @param schema - Valibot schema to validate response against
   * @param params - Optional query parameters (API key is added automatically)
   * @returns Validated response data
   * @throws TicketmasterValidationError if response doesn't match schema
   * @throws Error if API key is not defined or request fails
   */
  async fetchValidatedStrict<
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

  /**
   * Fetch and validate data from the Ticketmaster API (soft mode)
   *
   * Uses safe parsing that logs validation warnings but doesn't throw.
   * This is useful when you want to continue processing with partial data
   * rather than failing completely on minor schema mismatches.
   *
   * @param path - API endpoint path (e.g., "events", "events/123")
   * @param schema - Valibot schema to validate response against
   * @param params - Optional query parameters (API key is added automatically)
   * @returns Validated response data, or best-effort parsed data with warnings logged
   * @throws Error if API key is not defined or request fails
   *
   * @example
   * ```ts
   * const data = await TicketMasterClient.fetchValidatedSoft(
   *   "events/123",
   *   TicketMasterEventResponseSchema
   * );
   * // If validation fails, warnings are logged but data is still returned
   * ```
   */
  async fetchValidatedSoft<
    TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  >(
    path: string,
    schema: TSchema,
    params?: { [key: string]: string },
  ): Promise<v.InferOutput<TSchema>> {
    const data = await this.fetch(path, params);
    const result = v.safeParse(schema, data);

    if (!result.success) {
      const url = new URL(path, this.baseUrl);
      const issues = result.issues
        .map((issue) => {
          const pathStr =
            issue.path?.map((p) => String(p.key)).join(".") || "root";
          return `${pathStr}: ${issue.message}`;
        })
        .join(", ");

      console.warn(
        `[Ticketmaster] Soft validation warning for ${url.toString()}:`,
        issues,
      );

      // Return the original data cast to the expected type
      // This allows the code to continue with potentially incomplete data
      return data as v.InferOutput<TSchema>;
    }

    return result.output;
  }
}

export default new TicketMasterClient();
