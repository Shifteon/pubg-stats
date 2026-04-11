import { tool } from 'ai';
import { z } from 'zod';

export function getChatTools(baseUrl: string, headers?: Record<string, string>) {
  const fetchOptions = {
    headers: {
      ...headers,
    }
  };

  return {
    getPlayers: tool({
      description: "Get a list of all players in the system with their IDs.",
      inputSchema: z.object({}),
      execute: async () => {
        const res = await fetch(new URL("/api/player", baseUrl), fetchOptions);
        return res.json();
      }
    }),
    getTeams: tool({
      description: "Get a list of all teams in the system with their IDs.",
      inputSchema: z.object({}),
      execute: async () => {
        const res = await fetch(new URL("/api/team", baseUrl), fetchOptions);
        return res.json();
      }
    }),
    getPlayerOverview: tool({
      description: "Get a high-level overview of a player's stats, including their team performances, average damage, and win rates. Use this for general questions like 'Where do I need to improve?' or 'What team do I play best on?'",
      inputSchema: z.object({
        playerId: z.string()
      }),
      execute: async ({ playerId }) => {
        const res = await fetch(new URL(`/api/player/${playerId}`, baseUrl), fetchOptions);
        return res.json();
      }
    }),
    getPlayerGames: tool({
      description: "Get ALL of a player's games for a match type, sorted chronologically (Newest first). Always default to squad unless the user specifies duo. Good for 'How did I do yesterday' or 'last time I played'. CAUTION: The payload can be large.",
      inputSchema: z.object({
        playerId: z.string(),
        matchType: z.enum(["squad", "duo"]).optional()
      }),
      execute: async ({ playerId, matchType = "squad" }) => {
        const res = await fetch(new URL(`/api/player/${playerId}/games?matchType=${matchType}`, baseUrl), fetchOptions);
        return res.json();
      }
    }),
    getTeamOverview: tool({
      description: "Get detailed overview, hall of fame, and player list for a specific team. Great for 'How is team X performing right now?' or 'Who is the best player?'. Requires teamId which you can find via getTeams.",
      inputSchema: z.object({
        teamId: z.string()
      }),
      execute: async ({ teamId }) => {
        const res = await fetch(new URL(`/api/team/${teamId}/new/overview`, baseUrl), fetchOptions);
        return res.json();
      }
    }),
    getKillStealingForTeam: tool({
      description: "Get the current kill stealing percentages for all players on a team. Kill stealing is (% of team kills) - (% of team damage). A positive number means they steal kills. Requires teamId.",
      inputSchema: z.object({
        teamId: z.string()
      }),
      execute: async ({ teamId }) => {
        const res = await fetch(new URL(`/api/team/${teamId}/new/stats`, baseUrl), fetchOptions);
        const statData = await res.json();
        if (!statData || statData.length === 0) return {};
        // The last point in the timeline represents the current overall kill stealing percentage
        return statData[statData.length - 1].killStealing;
      }
    })
  };
}
