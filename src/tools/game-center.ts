import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { apiRequest } from "../client.js";
import { booleanParam, buildParams, jsonResponse } from "../helpers.js";

export function registerGameCenterTools(server: McpServer) {
  server.tool(
    "get_game_center_detail",
    "Get Game Center detail for an app, including leaderboards, achievements, leaderboard sets, and groups.",
    {
      app_id: z.string().describe("The App Store Connect app ID"),
    },
    async ({ app_id }) => {
      const params = buildParams({
        "include":
          "gameCenterAppVersions,gameCenterGroup,gameCenterLeaderboards,gameCenterLeaderboardSets,gameCenterAchievements",
      });

      const response = await apiRequest(
        "GET",
        `/v1/apps/${app_id}/gameCenterDetail`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "list_game_center_leaderboards",
    "List Game Center leaderboards for a Game Center detail.",
    {
      detail_id: z.string().describe("The Game Center detail ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ detail_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/gameCenterDetails/${detail_id}/gameCenterLeaderboards`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_game_center_leaderboard",
    "Create a new Game Center leaderboard.",
    {
      detail_id: z.string().describe("The Game Center detail ID to associate this leaderboard with"),
      defaultFormatter: z
        .enum([
          "INTEGER",
          "DECIMAL_POINT_1",
          "DECIMAL_POINT_2",
          "DECIMAL_POINT_3",
          "ELAPSED_TIME",
          "MONEY",
        ])
        .describe("The default formatter for leaderboard scores"),
      referenceName: z.string().describe("A reference name for the leaderboard"),
      vendorIdentifier: z.string().describe("A unique vendor identifier for the leaderboard"),
      submissionType: z
        .enum(["BEST_SCORE", "MOST_RECENT_SCORE"])
        .describe("How scores are submitted"),
      scoreSortType: z.enum(["ASC", "DESC"]).describe("Sort order for scores"),
      scoreRangeStart: z.string().optional().describe("Start of the score range"),
      scoreRangeEnd: z.string().optional().describe("End of the score range"),
      recurrenceStartDate: z
        .string()
        .optional()
        .describe("Start date for recurring leaderboard (ISO 8601)"),
      recurrenceDuration: z
        .string()
        .optional()
        .describe("Duration of each recurrence period"),
      recurrenceRule: z
        .string()
        .optional()
        .describe("Recurrence rule for the leaderboard"),
    },
    async ({
      detail_id,
      defaultFormatter,
      referenceName,
      vendorIdentifier,
      submissionType,
      scoreSortType,
      scoreRangeStart,
      scoreRangeEnd,
      recurrenceStartDate,
      recurrenceDuration,
      recurrenceRule,
    }) => {
      const attributes: Record<string, unknown> = {
        defaultFormatter,
        referenceName,
        vendorIdentifier,
        submissionType,
        scoreSortType,
      };
      if (scoreRangeStart !== undefined) attributes.scoreRangeStart = scoreRangeStart;
      if (scoreRangeEnd !== undefined) attributes.scoreRangeEnd = scoreRangeEnd;
      if (recurrenceStartDate !== undefined) attributes.recurrenceStartDate = recurrenceStartDate;
      if (recurrenceDuration !== undefined) attributes.recurrenceDuration = recurrenceDuration;
      if (recurrenceRule !== undefined) attributes.recurrenceRule = recurrenceRule;

      const body = {
        data: {
          type: "gameCenterLeaderboards",
          attributes,
          relationships: {
            gameCenterDetail: {
              data: {
                type: "gameCenterDetails",
                id: detail_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/gameCenterLeaderboards", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_game_center_leaderboard",
    "Update an existing Game Center leaderboard.",
    {
      id: z.string().describe("The Game Center leaderboard ID"),
      defaultFormatter: z
        .enum([
          "INTEGER",
          "DECIMAL_POINT_1",
          "DECIMAL_POINT_2",
          "DECIMAL_POINT_3",
          "ELAPSED_TIME",
          "MONEY",
        ])
        .optional()
        .describe("Updated default formatter"),
      referenceName: z.string().optional().describe("Updated reference name"),
      submissionType: z
        .enum(["BEST_SCORE", "MOST_RECENT_SCORE"])
        .optional()
        .describe("Updated submission type"),
      scoreSortType: z.enum(["ASC", "DESC"]).optional().describe("Updated sort order"),
      scoreRangeStart: z.string().optional().describe("Updated start of score range"),
      scoreRangeEnd: z.string().optional().describe("Updated end of score range"),
      recurrenceStartDate: z.string().optional().describe("Updated recurrence start date"),
      recurrenceDuration: z.string().optional().describe("Updated recurrence duration"),
      recurrenceRule: z.string().optional().describe("Updated recurrence rule"),
    },
    async ({
      id,
      defaultFormatter,
      referenceName,
      submissionType,
      scoreSortType,
      scoreRangeStart,
      scoreRangeEnd,
      recurrenceStartDate,
      recurrenceDuration,
      recurrenceRule,
    }) => {
      const attributes: Record<string, unknown> = {};
      if (defaultFormatter !== undefined) attributes.defaultFormatter = defaultFormatter;
      if (referenceName !== undefined) attributes.referenceName = referenceName;
      if (submissionType !== undefined) attributes.submissionType = submissionType;
      if (scoreSortType !== undefined) attributes.scoreSortType = scoreSortType;
      if (scoreRangeStart !== undefined) attributes.scoreRangeStart = scoreRangeStart;
      if (scoreRangeEnd !== undefined) attributes.scoreRangeEnd = scoreRangeEnd;
      if (recurrenceStartDate !== undefined) attributes.recurrenceStartDate = recurrenceStartDate;
      if (recurrenceDuration !== undefined) attributes.recurrenceDuration = recurrenceDuration;
      if (recurrenceRule !== undefined) attributes.recurrenceRule = recurrenceRule;

      const body = {
        data: {
          type: "gameCenterLeaderboards",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/gameCenterLeaderboards/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_game_center_leaderboard",
    "Delete a Game Center leaderboard.",
    {
      id: z.string().describe("The Game Center leaderboard ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/gameCenterLeaderboards/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted Game Center leaderboard ${id}`,
      });
    }
  );

  server.tool(
    "list_game_center_achievements",
    "List Game Center achievements for a Game Center detail.",
    {
      detail_id: z.string().describe("The Game Center detail ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ detail_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/gameCenterDetails/${detail_id}/gameCenterAchievements`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_game_center_achievement",
    "Create a new Game Center achievement.",
    {
      detail_id: z
        .string()
        .describe("The Game Center detail ID to associate this achievement with"),
      referenceName: z.string().describe("A reference name for the achievement"),
      vendorIdentifier: z.string().describe("A unique vendor identifier for the achievement"),
      points: z.coerce.number().describe("Point value of the achievement"),
      showBeforeEarned: booleanParam
        .describe("Whether to show the achievement before it is earned"),
      repeatable: booleanParam.describe("Whether the achievement can be earned multiple times"),
    },
    async ({ detail_id, referenceName, vendorIdentifier, points, showBeforeEarned, repeatable }) => {
      const body = {
        data: {
          type: "gameCenterAchievements",
          attributes: {
            referenceName,
            vendorIdentifier,
            points,
            showBeforeEarned,
            repeatable,
          },
          relationships: {
            gameCenterDetail: {
              data: {
                type: "gameCenterDetails",
                id: detail_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/gameCenterAchievements", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "update_game_center_achievement",
    "Update an existing Game Center achievement.",
    {
      id: z.string().describe("The Game Center achievement ID"),
      referenceName: z.string().optional().describe("Updated reference name"),
      points: z.coerce.number().optional().describe("Updated point value"),
      showBeforeEarned: booleanParam
        .optional()
        .describe("Updated show before earned setting"),
      repeatable: booleanParam.optional().describe("Updated repeatable setting"),
    },
    async ({ id, referenceName, points, showBeforeEarned, repeatable }) => {
      const attributes: Record<string, unknown> = {};
      if (referenceName !== undefined) attributes.referenceName = referenceName;
      if (points !== undefined) attributes.points = points;
      if (showBeforeEarned !== undefined) attributes.showBeforeEarned = showBeforeEarned;
      if (repeatable !== undefined) attributes.repeatable = repeatable;

      const body = {
        data: {
          type: "gameCenterAchievements",
          id,
          attributes,
        },
      };

      const response = await apiRequest(
        "PATCH",
        `/v1/gameCenterAchievements/${id}`,
        body
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_game_center_achievement",
    "Delete a Game Center achievement.",
    {
      id: z.string().describe("The Game Center achievement ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/gameCenterAchievements/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted Game Center achievement ${id}`,
      });
    }
  );

  server.tool(
    "list_game_center_leaderboard_sets",
    "List Game Center leaderboard sets for a Game Center detail.",
    {
      detail_id: z.string().describe("The Game Center detail ID"),
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ detail_id, limit }) => {
      const params = buildParams({
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        `/v1/gameCenterDetails/${detail_id}/gameCenterLeaderboardSets`,
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_game_center_leaderboard_set",
    "Create a new Game Center leaderboard set.",
    {
      detail_id: z
        .string()
        .describe("The Game Center detail ID to associate this leaderboard set with"),
      referenceName: z.string().describe("A reference name for the leaderboard set"),
      vendorIdentifier: z.string().describe("A unique vendor identifier for the leaderboard set"),
    },
    async ({ detail_id, referenceName, vendorIdentifier }) => {
      const body = {
        data: {
          type: "gameCenterLeaderboardSets",
          attributes: {
            referenceName,
            vendorIdentifier,
          },
          relationships: {
            gameCenterDetail: {
              data: {
                type: "gameCenterDetails",
                id: detail_id,
              },
            },
          },
        },
      };

      const response = await apiRequest("POST", "/v1/gameCenterLeaderboardSets", body);

      return jsonResponse(response);
    }
  );

  server.tool(
    "delete_game_center_leaderboard_set",
    "Delete a Game Center leaderboard set.",
    {
      id: z.string().describe("The Game Center leaderboard set ID to delete"),
    },
    async ({ id }) => {
      await apiRequest("DELETE", `/v1/gameCenterLeaderboardSets/${id}`);

      return jsonResponse({
        success: true,
        message: `Deleted Game Center leaderboard set ${id}`,
      });
    }
  );

  server.tool(
    "list_game_center_groups",
    "List Game Center groups, including their Game Center details.",
    {
      limit: z.coerce.number().min(1).max(200).optional(),
    },
    async ({ limit }) => {
      const params = buildParams({
        "include": "gameCenterDetails",
        "limit": limit,
      });

      const response = await apiRequest(
        "GET",
        "/v1/gameCenterGroups",
        undefined,
        params
      );

      return jsonResponse(response);
    }
  );

  server.tool(
    "create_game_center_group",
    "Create a new Game Center group.",
    {
      referenceName: z.string().describe("A reference name for the group"),
    },
    async ({ referenceName }) => {
      const body = {
        data: {
          type: "gameCenterGroups",
          attributes: {
            referenceName,
          },
        },
      };

      const response = await apiRequest("POST", "/v1/gameCenterGroups", body);

      return jsonResponse(response);
    }
  );
}
