/**
 * Custom error classes for Ticketmaster API client
 */
import type { BaseIssue, BaseSchema, InferIssue, ValiError } from "valibot";

/**
 * Error thrown when API response validation fails
 */
export class TicketmasterValidationError<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends Error {
  public readonly validationError: ValiError<TSchema>;
  public readonly url: string;

  constructor(validationError: ValiError<TSchema>, url: string) {
    const issues = validationError.issues
      .map((issue: InferIssue<TSchema>) => {
        const pathStr =
          issue.path?.map((p) => String(p.key)).join(".") || "root";
        return `${pathStr}: ${issue.message}`;
      })
      .join(", ");

    super(
      `Ticketmaster API response validation failed for ${url}. Issues: ${issues}`,
    );

    this.name = "TicketmasterValidationError";
    this.validationError = validationError;
    this.url = url;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TicketmasterValidationError);
    }
  }

  /**
   * Get all validation issues
   */
  getIssues() {
    return this.validationError.issues;
  }

  /**
   * Get formatted error message with all issues
   */
  getDetailedMessage(): string {
    const issueDetails = this.validationError.issues
      .map((issue: InferIssue<TSchema>, index: number) => {
        const path = issue.path?.map((p) => String(p.key)).join(".") || "root";
        return `  ${index + 1}. ${path}: ${issue.message}`;
      })
      .join("\n");

    return `Ticketmaster API validation failed for ${this.url}\n\nIssues:\n${issueDetails}`;
  }
}
