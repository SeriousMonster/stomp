import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the auth module before importing client
vi.mock("../src/auth.js", () => ({
  generateToken: () => "mock-jwt-token",
}));

// We need to mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { apiRequest, apiRequestAllPages } from "../src/client.js";

describe("client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("apiRequest", () => {
    it("builds correct URL with params and auth header for GET", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ data: [{ id: "1", type: "apps" }] }),
      });

      const result = await apiRequest("GET", "/v1/apps", undefined, {
        "filter[bundleId]": "com.example.app",
        limit: "10",
      });

      expect(mockFetch).toHaveBeenCalledOnce();

      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toContain("https://api.appstoreconnect.apple.com/v1/apps");
      expect(url).toContain("filter%5BbundleId%5D=com.example.app");
      expect(url).toContain("limit=10");
      expect(options.method).toBe("GET");
      expect(options.headers.Authorization).toBe("Bearer mock-jwt-token");
      expect(options.headers["Content-Type"]).toBe("application/json");
      expect(options.body).toBeUndefined();

      expect(result.data).toEqual([{ id: "1", type: "apps" }]);
    });

    it("sends JSON body for POST requests", async () => {
      const requestBody = {
        data: {
          type: "apps",
          attributes: { name: "My App" },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ data: { id: "123", type: "apps" } }),
      });

      await apiRequest("POST", "/v1/apps", requestBody);

      const [, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe("POST");
      expect(options.body).toBe(JSON.stringify(requestBody));
    });

    it("parses API error responses correctly", async () => {
      const errorResponse = {
        errors: [
          {
            status: "409",
            code: "ENTITY_ERROR.ATTRIBUTE.INVALID",
            title: "An attribute value is invalid",
            detail: "The bundle ID is already in use",
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: "Conflict",
        text: async () => JSON.stringify(errorResponse),
      });

      await expect(apiRequest("POST", "/v1/apps", {})).rejects.toThrow(
        "App Store Connect API error"
      );
      await expect(
        apiRequest("POST", "/v1/apps", {})
      ).rejects.toThrow();

      // Let's test the actual error message format more precisely
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: "Conflict",
        text: async () => JSON.stringify(errorResponse),
      });

      try {
        await apiRequest("POST", "/v1/apps", {});
        expect.unreachable("Should have thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("409 ENTITY_ERROR.ATTRIBUTE.INVALID");
        expect(error.message).toContain("An attribute value is invalid");
        expect(error.message).toContain("The bundle ID is already in use");
      }
    });

    it("handles non-JSON error responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "Something went very wrong",
      });

      try {
        await apiRequest("GET", "/v1/apps");
        expect.unreachable("Should have thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).toContain("App Store Connect API error");
        expect(error.message).toContain("Something went very wrong");
      }
    });

    it("returns { data: null } for 204 No Content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      });

      const result = await apiRequest("DELETE", "/v1/betaGroups/123");

      expect(result).toEqual({ data: null });
    });

    it("excludes query params with empty or undefined values", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ data: [] }),
      });

      await apiRequest("GET", "/v1/apps", undefined, {
        "filter[name]": "MyApp",
        "filter[bundleId]": "",
        "filter[sku]": undefined as unknown as string,
      });

      const [url] = mockFetch.mock.calls[0];
      const parsedUrl = new URL(url);

      expect(parsedUrl.searchParams.has("filter[name]")).toBe(true);
      expect(parsedUrl.searchParams.get("filter[name]")).toBe("MyApp");
      expect(parsedUrl.searchParams.has("filter[bundleId]")).toBe(false);
      expect(parsedUrl.searchParams.has("filter[sku]")).toBe(false);
    });
  });

  describe("apiRequestAllPages", () => {
    it("follows pagination links and aggregates data", async () => {
      // Page 1
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [
              { id: "1", type: "apps" },
              { id: "2", type: "apps" },
            ],
            links: {
              next: "https://api.appstoreconnect.apple.com/v1/apps?cursor=abc&limit=2",
            },
          }),
      });

      // Page 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [{ id: "3", type: "apps" }],
            // No next link — this is the last page
          }),
      });

      const result = await apiRequestAllPages("/v1/apps", { limit: "2" });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual([
        { id: "1", type: "apps" },
        { id: "2", type: "apps" },
        { id: "3", type: "apps" },
      ]);
      expect(result.meta?.paging?.total).toBe(3);
    });

    it("aggregates included resources across pages", async () => {
      // Page 1
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [{ id: "1", type: "apps" }],
            included: [{ id: "v1", type: "appStoreVersions" }],
            links: {
              next: "https://api.appstoreconnect.apple.com/v1/apps?cursor=abc",
            },
          }),
      });

      // Page 2
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [{ id: "2", type: "apps" }],
            included: [{ id: "v2", type: "appStoreVersions" }],
          }),
      });

      const result = await apiRequestAllPages("/v1/apps");

      expect(result.data).toHaveLength(2);
      expect(result.included).toEqual([
        { id: "v1", type: "appStoreVersions" },
        { id: "v2", type: "appStoreVersions" },
      ]);
    });

    it("respects maxPages limit", async () => {
      // Create responses that always have a next link
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          text: async () =>
            JSON.stringify({
              data: [{ id: String(i + 1), type: "apps" }],
              links: {
                next: `https://api.appstoreconnect.apple.com/v1/apps?cursor=page${i + 2}`,
              },
            }),
        });
      }

      const result = await apiRequestAllPages("/v1/apps", undefined, 2);

      // pages starts at 0, the while loop condition is `pages < maxPages`.
      // Iteration 1: pages=0, fetches page, finds next, pages++ -> pages=1
      // Iteration 2: pages=1 (<2), fetches page, finds next, pages++ -> pages=2
      // Iteration 3: pages=2, NOT <2, loop exits.
      // So with maxPages=2 we get exactly 2 fetches total.
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.data).toHaveLength(2);
    });

    it("handles single (non-array) data responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: { id: "1", type: "apps" },
          }),
      });

      const result = await apiRequestAllPages("/v1/apps/1");

      expect(result.data).toEqual([{ id: "1", type: "apps" }]);
    });

    it("omits included when no pages have included data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            data: [{ id: "1", type: "apps" }],
          }),
      });

      const result = await apiRequestAllPages("/v1/apps");

      expect(result.included).toBeUndefined();
    });
  });
});
