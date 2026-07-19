/**
 * Shared helpers for Express controllers.
 *
 * These centralise request-parsing and error-shaping logic that was previously
 * duplicated across every controller.
 */

/**
 * Parses a value expected to be an integer identifier (typically an Express
 * route param) into a number. Returns null when the value cannot be parsed to a
 * number so callers can respond with a 400 in a single `=== null` check,
 * replacing the repeated `parseInt(...)` + `isNaN(...)` pattern.
 */
export const parseNumericId = (value: string): number | null => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Extracts a human-readable message from an unknown error value, replacing the
 * `error instanceof Error ? error.message : String(error)` pattern duplicated
 * across controllers and services.
 */
export const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : String(error);
};
