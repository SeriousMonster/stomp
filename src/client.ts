import { generateToken } from "./auth.js";

const BASE_URL = "https://api.appstoreconnect.apple.com";

export interface ApiResponse {
  data: unknown;
  included?: unknown[];
  links?: Record<string, string>;
  meta?: { paging?: { total: number } };
}

export interface ApiError {
  errors: Array<{
    status: string;
    code: string;
    title: string;
    detail: string;
  }>;
}

export async function apiRequest(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>
): Promise<ApiResponse> {
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const token = generateToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();

  if (!response.ok) {
    let errorDetail: string;
    try {
      const errorJson = JSON.parse(text) as ApiError;
      errorDetail = errorJson.errors
        .map((e) => `${e.status} ${e.code}: ${e.title} - ${e.detail}`)
        .join("\n");
    } catch {
      errorDetail = text || `HTTP ${response.status} ${response.statusText}`;
    }
    throw new Error(`App Store Connect API error:\n${errorDetail}`);
  }

  // Some endpoints return 204 No Content
  if (!text) {
    return { data: null };
  }

  return JSON.parse(text) as ApiResponse;
}

// Helper to auto-paginate collection endpoints
export async function apiRequestAllPages(
  path: string,
  params?: Record<string, string>,
  maxPages = 10
): Promise<ApiResponse> {
  const allData: unknown[] = [];
  const allIncluded: unknown[] = [];
  let currentPath = path;
  let currentParams = params;
  let pages = 0;

  while (pages < maxPages) {
    const response = await apiRequest("GET", currentPath, undefined, currentParams);

    if (Array.isArray(response.data)) {
      allData.push(...response.data);
    } else if (response.data) {
      allData.push(response.data);
    }

    if (response.included) {
      allIncluded.push(...response.included);
    }

    const nextUrl = response.links?.next;
    if (!nextUrl) break;

    // Parse the next URL to extract path and params
    const next = new URL(nextUrl);
    currentPath = next.pathname;
    currentParams = Object.fromEntries(next.searchParams.entries());
    pages++;
  }

  return {
    data: allData,
    ...(allIncluded.length > 0 ? { included: allIncluded } : {}),
    meta: { paging: { total: allData.length } },
  };
}
