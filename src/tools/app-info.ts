import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";

export function registerAppInfoTools(server: McpServer) {
  server.tool(
    "list_app_infos",
    "List all app infos for an app. Each app info represents a version-specific set of metadata.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
      include: z
        .string()
        .optional()
        .describe(
          "Comma-separated includes (e.g., appInfoLocalizations,primaryCategory,secondaryCategory)"
        ),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ app_id, include, limit }) => {
      const params: Record<string, string> = {};
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/appInfos`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "get_app_info",
    "Get a specific app info by ID, optionally including localizations.",
    {
      id: z.string().describe("The app info ID"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., appInfoLocalizations)"),
    },
    async ({ id, include }) => {
      const params: Record<string, string> = {};
      if (include) params["include"] = include;

      const response = await apiRequest(
        "GET",
        `/v1/appInfos/${id}`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "update_app_info",
    "Update an app info's category relationships (primary/secondary categories and subcategories).",
    {
      id: z.string().describe("The app info ID"),
      primaryCategory_id: z
        .string()
        .optional()
        .describe("App category ID for the primary category"),
      primarySubcategoryOne_id: z
        .string()
        .optional()
        .describe("App category ID for primary subcategory one"),
      primarySubcategoryTwo_id: z
        .string()
        .optional()
        .describe("App category ID for primary subcategory two"),
      secondaryCategory_id: z
        .string()
        .optional()
        .describe("App category ID for the secondary category"),
      secondarySubcategoryOne_id: z
        .string()
        .optional()
        .describe("App category ID for secondary subcategory one"),
      secondarySubcategoryTwo_id: z
        .string()
        .optional()
        .describe("App category ID for secondary subcategory two"),
    },
    async ({
      id,
      primaryCategory_id,
      primarySubcategoryOne_id,
      primarySubcategoryTwo_id,
      secondaryCategory_id,
      secondarySubcategoryOne_id,
      secondarySubcategoryTwo_id,
    }) => {
      const relationships: Record<string, unknown> = {};

      if (primaryCategory_id !== undefined) {
        relationships.primaryCategory = {
          data: primaryCategory_id
            ? { type: "appCategories", id: primaryCategory_id }
            : null,
        };
      }
      if (primarySubcategoryOne_id !== undefined) {
        relationships.primarySubcategoryOne = {
          data: primarySubcategoryOne_id
            ? { type: "appCategories", id: primarySubcategoryOne_id }
            : null,
        };
      }
      if (primarySubcategoryTwo_id !== undefined) {
        relationships.primarySubcategoryTwo = {
          data: primarySubcategoryTwo_id
            ? { type: "appCategories", id: primarySubcategoryTwo_id }
            : null,
        };
      }
      if (secondaryCategory_id !== undefined) {
        relationships.secondaryCategory = {
          data: secondaryCategory_id
            ? { type: "appCategories", id: secondaryCategory_id }
            : null,
        };
      }
      if (secondarySubcategoryOne_id !== undefined) {
        relationships.secondarySubcategoryOne = {
          data: secondarySubcategoryOne_id
            ? { type: "appCategories", id: secondarySubcategoryOne_id }
            : null,
        };
      }
      if (secondarySubcategoryTwo_id !== undefined) {
        relationships.secondarySubcategoryTwo = {
          data: secondarySubcategoryTwo_id
            ? { type: "appCategories", id: secondarySubcategoryTwo_id }
            : null,
        };
      }

      const body = {
        data: {
          type: "appInfos",
          id,
          relationships,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/appInfos/${id}`,
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "list_app_info_localizations",
    "List all localizations for an app info (name, subtitle, privacy policy per locale).",
    {
      app_info_id: z.string().describe("The app info ID"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ app_info_id, limit }) => {
      const params: Record<string, string> = {};
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        `/v1/appInfos/${app_info_id}/appInfoLocalizations`,
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "update_app_info_localization",
    "Update an app info localization (name, subtitle, privacy policy URL/text).",
    {
      id: z.string().describe("The app info localization ID"),
      name: z.string().optional().describe("App name for this locale"),
      subtitle: z.string().optional().describe("App subtitle for this locale"),
      privacyPolicyUrl: z.string().optional().describe("Privacy policy URL"),
      privacyChoicesUrl: z.string().optional().describe("Privacy choices URL"),
      privacyPolicyText: z.string().optional().describe("Privacy policy text"),
    },
    async ({ id, name, subtitle, privacyPolicyUrl, privacyChoicesUrl, privacyPolicyText }) => {
      const attributes: Record<string, unknown> = {};
      if (name !== undefined) attributes.name = name;
      if (subtitle !== undefined) attributes.subtitle = subtitle;
      if (privacyPolicyUrl !== undefined) attributes.privacyPolicyUrl = privacyPolicyUrl;
      if (privacyChoicesUrl !== undefined) attributes.privacyChoicesUrl = privacyChoicesUrl;
      if (privacyPolicyText !== undefined) attributes.privacyPolicyText = privacyPolicyText;

      const body = {
        data: {
          type: "appInfoLocalizations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/appInfoLocalizations/${id}`,
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "list_app_categories",
    "List App Store categories, optionally filtered by platform and including subcategories.",
    {
      filter_platforms: z
        .string()
        .optional()
        .describe("Filter by platforms (e.g., IOS, MAC_OS, TV_OS)"),
      include: z
        .string()
        .optional()
        .describe("Comma-separated includes (e.g., subcategories)"),
      limit: z.number().min(1).max(200).optional(),
    },
    async ({ filter_platforms, include, limit }) => {
      const params: Record<string, string> = {};
      if (filter_platforms) params["filter[platforms]"] = filter_platforms;
      if (include) params["include"] = include;
      if (limit) params["limit"] = String(limit);

      const response = await apiRequest(
        "GET",
        "/v1/appCategories",
        undefined,
        params
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "list_age_rating_declarations",
    "Get the age rating declaration for an app info.",
    {
      app_info_id: z.string().describe("The app info ID"),
    },
    async ({ app_info_id }) => {
      const response = await apiRequest(
        "GET",
        `/v1/appInfos/${app_info_id}/ageRatingDeclaration`
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );

  server.tool(
    "update_age_rating_declaration",
    "Update the age rating declaration for an app. Values are NONE, INFREQUENT_OR_MILD, or FREQUENT_OR_INTENSE unless otherwise noted.",
    {
      id: z.string().describe("The age rating declaration ID"),
      alcoholTobaccoOrDrugUseOrReferences: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Alcohol, tobacco, or drug use or references"),
      contests: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Contests"),
      gamblingSimulated: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Simulated gambling"),
      horrorOrFearThemes: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Horror or fear themes"),
      matureOrSuggestiveThemes: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Mature or suggestive themes"),
      medicalOrTreatmentInformation: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Medical or treatment information"),
      profanityOrCrudeHumor: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Profanity or crude humor"),
      sexualContentGraphicAndNudity: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Sexual content - graphic and nudity"),
      sexualContentOrNudity: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Sexual content or nudity"),
      violenceCartoonOrFantasy: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Cartoon or fantasy violence"),
      violenceRealistic: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Realistic violence"),
      violenceRealisticProlongedGraphicOrSadistic: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Realistic prolonged graphic or sadistic violence"),
      gunsOrOtherWeapons: z
        .enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"])
        .optional()
        .describe("Guns or other weapons"),
      kidsAgeBand: z
        .enum(["FIVE_AND_UNDER", "SIX_TO_EIGHT", "NINE_TO_ELEVEN"])
        .optional()
        .describe("Kids age band (for Made for Kids apps)"),
      gambling: z.boolean().optional().describe("Real gambling"),
      lootBox: z.boolean().optional().describe("Loot boxes / randomized purchases"),
      unrestrictedWebAccess: z.boolean().optional().describe("Unrestricted web access"),
      parentalControls: z.boolean().optional().describe("Parental controls"),
      messagingAndChat: z.boolean().optional().describe("Messaging and chat"),
      advertising: z.boolean().optional().describe("Advertising"),
      userGeneratedContent: z.boolean().optional().describe("User generated content"),
      healthOrWellnessTopics: z.boolean().optional().describe("Health or wellness topics"),
      ageAssurance: z.boolean().optional().describe("Age assurance / verification"),
    },
    async ({
      id,
      alcoholTobaccoOrDrugUseOrReferences,
      contests,
      gamblingSimulated,
      gambling,
      horrorOrFearThemes,
      matureOrSuggestiveThemes,
      medicalOrTreatmentInformation,
      profanityOrCrudeHumor,
      sexualContentGraphicAndNudity,
      sexualContentOrNudity,
      violenceCartoonOrFantasy,
      violenceRealistic,
      violenceRealisticProlongedGraphicOrSadistic,
      gunsOrOtherWeapons,
      kidsAgeBand,
      lootBox,
      unrestrictedWebAccess,
      parentalControls,
      messagingAndChat,
      advertising,
      userGeneratedContent,
      healthOrWellnessTopics,
      ageAssurance,
    }) => {
      const attributes: Record<string, unknown> = {};
      if (alcoholTobaccoOrDrugUseOrReferences !== undefined)
        attributes.alcoholTobaccoOrDrugUseOrReferences = alcoholTobaccoOrDrugUseOrReferences;
      if (contests !== undefined) attributes.contests = contests;
      if (gamblingSimulated !== undefined) attributes.gamblingSimulated = gamblingSimulated;
      if (horrorOrFearThemes !== undefined) attributes.horrorOrFearThemes = horrorOrFearThemes;
      if (matureOrSuggestiveThemes !== undefined)
        attributes.matureOrSuggestiveThemes = matureOrSuggestiveThemes;
      if (medicalOrTreatmentInformation !== undefined)
        attributes.medicalOrTreatmentInformation = medicalOrTreatmentInformation;
      if (profanityOrCrudeHumor !== undefined)
        attributes.profanityOrCrudeHumor = profanityOrCrudeHumor;
      if (sexualContentGraphicAndNudity !== undefined)
        attributes.sexualContentGraphicAndNudity = sexualContentGraphicAndNudity;
      if (sexualContentOrNudity !== undefined)
        attributes.sexualContentOrNudity = sexualContentOrNudity;
      if (violenceCartoonOrFantasy !== undefined)
        attributes.violenceCartoonOrFantasy = violenceCartoonOrFantasy;
      if (violenceRealistic !== undefined) attributes.violenceRealistic = violenceRealistic;
      if (violenceRealisticProlongedGraphicOrSadistic !== undefined)
        attributes.violenceRealisticProlongedGraphicOrSadistic =
          violenceRealisticProlongedGraphicOrSadistic;
      if (gunsOrOtherWeapons !== undefined) attributes.gunsOrOtherWeapons = gunsOrOtherWeapons;
      if (kidsAgeBand !== undefined) attributes.kidsAgeBand = kidsAgeBand;
      if (gambling !== undefined) attributes.gambling = gambling;
      if (lootBox !== undefined) attributes.lootBox = lootBox;
      if (unrestrictedWebAccess !== undefined)
        attributes.unrestrictedWebAccess = unrestrictedWebAccess;
      if (parentalControls !== undefined) attributes.parentalControls = parentalControls;
      if (messagingAndChat !== undefined) attributes.messagingAndChat = messagingAndChat;
      if (advertising !== undefined) attributes.advertising = advertising;
      if (userGeneratedContent !== undefined) attributes.userGeneratedContent = userGeneratedContent;
      if (healthOrWellnessTopics !== undefined)
        attributes.healthOrWellnessTopics = healthOrWellnessTopics;
      if (ageAssurance !== undefined) attributes.ageAssurance = ageAssurance;

      const body = {
        data: {
          type: "ageRatingDeclarations",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/ageRatingDeclarations/${id}`,
        body
      );

      return {
        content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }],
      };
    }
  );
}
