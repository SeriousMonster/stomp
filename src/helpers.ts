import { z } from "zod";

/**
 * Boolean schema that correctly handles string "true"/"false" coercion.
 * z.coerce.boolean() is broken for strings because Boolean("false") === true.
 * This preprocessor converts string "true"/"false" to actual booleans first.
 */
export const booleanParam = z.preprocess((val) => {
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0" || lower === "") return false;
  }
  return val;
}, z.boolean());

// Helper to build query params, filtering out undefined values
export function buildParams(entries: Record<string, string | number | boolean | undefined>): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== null) {
      params[key] = String(value);
    }
  }
  return params;
}

// Helper to format JSON API response
export function jsonResponse(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

// Helper to format error response
export function errorResponse(message: string) {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}
