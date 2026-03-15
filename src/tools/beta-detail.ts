import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, buildParams, jsonResponse } from "../helpers.js";

export function registerBetaDetailTools(server: McpServer) {
  server.tool(
    "list_beta_app_localizations",
    "List TestFlight app-level localizations (descriptions per locale) for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ app_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/betaAppLocalizations`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_beta_app_localization",
    "Create a TestFlight app-level localization for a specific locale. Sets description, feedback email, and URLs.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      locale: z.string().describe("Locale code (e.g., en-US, fr-FR)"),
      description: z.string().optional().describe("TestFlight app description for this locale"),
      feedbackEmail: z.string().optional().describe("Feedback email address"),
      marketingUrl: z.string().optional().describe("Marketing URL"),
      privacyPolicyUrl: z.string().optional().describe("Privacy policy URL"),
      tvOsPrivacyPolicy: z.string().optional().describe("tvOS privacy policy text"),
    },
    async ({ app_id, locale, description, feedbackEmail, marketingUrl, privacyPolicyUrl, tvOsPrivacyPolicy }) => {
      const attributes: Record<string, unknown> = { locale };
      if (description !== undefined) attributes.description = description;
      if (feedbackEmail !== undefined) attributes.feedbackEmail = feedbackEmail;
      if (marketingUrl !== undefined) attributes.marketingUrl = marketingUrl;
      if (privacyPolicyUrl !== undefined) attributes.privacyPolicyUrl = privacyPolicyUrl;
      if (tvOsPrivacyPolicy !== undefined) attributes.tvOsPrivacyPolicy = tvOsPrivacyPolicy;

      const body = {
        data: {
          type: "betaAppLocalizations",
          attributes,
          relationships: {
            app: {
              data: {
                type: "apps",
                id: app_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/betaAppLocalizations", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_beta_app_localization",
    "Update a TestFlight app-level localization. Change description, feedback email, or URLs.",
    {
      id: z.string().describe("The beta app localization ID"),
      description: z.string().optional().describe("TestFlight app description"),
      feedbackEmail: z.string().optional().describe("Feedback email address"),
      marketingUrl: z.string().optional().describe("Marketing URL"),
      privacyPolicyUrl: z.string().optional().describe("Privacy policy URL"),
      tvOsPrivacyPolicy: z.string().optional().describe("tvOS privacy policy text"),
    },
    async ({ id, description, feedbackEmail, marketingUrl, privacyPolicyUrl, tvOsPrivacyPolicy }) => {
      const attributes: Record<string, unknown> = {};
      if (description !== undefined) attributes.description = description;
      if (feedbackEmail !== undefined) attributes.feedbackEmail = feedbackEmail;
      if (marketingUrl !== undefined) attributes.marketingUrl = marketingUrl;
      if (privacyPolicyUrl !== undefined) attributes.privacyPolicyUrl = privacyPolicyUrl;
      if (tvOsPrivacyPolicy !== undefined) attributes.tvOsPrivacyPolicy = tvOsPrivacyPolicy;

      const body = {
        data: {
          type: "betaAppLocalizations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/betaAppLocalizations/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_beta_build_localizations",
    "List TestFlight build-level localizations ('What to Test' per locale) for a build.",
    {
      build_id: z.string().describe("The build ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ build_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/builds/${build_id}/betaBuildLocalizations`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_beta_build_localization",
    "Create a TestFlight build-level localization ('What to Test') for a specific locale.",
    {
      build_id: z.string().describe("The build ID"),
      locale: z.string().describe("Locale code (e.g., en-US, fr-FR)"),
      whatsNew: z.string().optional().describe("What to test text for this build"),
    },
    async ({ build_id, locale, whatsNew }) => {
      const attributes: Record<string, unknown> = { locale };
      if (whatsNew !== undefined) attributes.whatsNew = whatsNew;

      const body = {
        data: {
          type: "betaBuildLocalizations",
          attributes,
          relationships: {
            build: {
              data: {
                type: "builds",
                id: build_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/betaBuildLocalizations", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_beta_build_localization",
    "Update a TestFlight build-level localization. Change the 'What to Test' text.",
    {
      id: z.string().describe("The beta build localization ID"),
      whatsNew: z.string().optional().describe("What to test text for this build"),
    },
    async ({ id, whatsNew }) => {
      const attributes: Record<string, unknown> = {};
      if (whatsNew !== undefined) attributes.whatsNew = whatsNew;

      const body = {
        data: {
          type: "betaBuildLocalizations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/betaBuildLocalizations/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "submit_build_for_beta_review",
    "Submit a build for TestFlight beta review.",
    {
      build_id: z.string().describe("The build ID to submit for beta review"),
    },
    async ({ build_id }) => {
      const body = {
        data: {
          type: "betaAppReviewSubmissions",
          relationships: {
            build: {
              data: {
                type: "builds",
                id: build_id,
              },
            },
          },
        },
      };

      const response = await apiRequest(
        "POST",
        "/v1/betaAppReviewSubmissions",
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "get_beta_app_review_detail",
    "Get the beta app review detail (contact info and demo account) for an app.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
    },
    async ({ app_id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/betaAppReviewDetail`
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_beta_app_review_detail",
    "Update the beta app review detail (contact info and demo account credentials).",
    {
      id: z.string().describe("The beta app review detail ID"),
      contactFirstName: z.string().optional().describe("Contact first name"),
      contactLastName: z.string().optional().describe("Contact last name"),
      contactPhone: z.string().optional().describe("Contact phone number"),
      contactEmail: z.string().optional().describe("Contact email address"),
      demoAccountName: z.string().optional().describe("Demo account username"),
      demoAccountPassword: z.string().optional().describe("Demo account password"),
      demoAccountRequired: booleanParam.optional().describe("Whether a demo account is required"),
      notes: z.string().optional().describe("Additional notes for the reviewer"),
    },
    async ({
      id,
      contactFirstName,
      contactLastName,
      contactPhone,
      contactEmail,
      demoAccountName,
      demoAccountPassword,
      demoAccountRequired,
      notes,
    }) => {
      const attributes: Record<string, unknown> = {};
      if (contactFirstName !== undefined) attributes.contactFirstName = contactFirstName;
      if (contactLastName !== undefined) attributes.contactLastName = contactLastName;
      if (contactPhone !== undefined) attributes.contactPhone = contactPhone;
      if (contactEmail !== undefined) attributes.contactEmail = contactEmail;
      if (demoAccountName !== undefined) attributes.demoAccountName = demoAccountName;
      if (demoAccountPassword !== undefined) attributes.demoAccountPassword = demoAccountPassword;
      if (demoAccountRequired !== undefined) attributes.demoAccountRequired = demoAccountRequired;
      if (notes !== undefined) attributes.notes = notes;

      const body = {
        data: {
          type: "betaAppReviewDetails",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/betaAppReviewDetails/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );
}
