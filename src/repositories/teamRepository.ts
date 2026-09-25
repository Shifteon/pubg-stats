import { createClient } from "@/lib/supabase/server";
import { QueryData, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

/**
 * We define the query in a standalone function so we can extract its return type.
 */
const getTeamGamesQuery = (client: SupabaseClient<Database>, teamId: string) => {
  return client
    .from("games")
    .select(`
      id, 
      is_win, 
      played_at,
      team_sort_order,
      game_player_stats (
        player_id, 
        kills, 
        damage, 
        assists, 
        rescues, 
        recalls,
        players (
          name
        )
      )
    `)
    .eq("team_id", teamId)
    .order("team_sort_order")
    .order("played_at", { nullsFirst: true });
};

// This automatically infers the exact shape of the returned array from the .select() string!
export type TeamGamesWithStats = QueryData<ReturnType<typeof getTeamGamesQuery>>;

export class TeamRepository {
  /**
   * Fetches all games and their associated player stats for a specific team.
   * This serves as the raw data foundation for the Team Dashboard calculations.
   */
  async getTeamGamesWithStats(teamId: string): Promise<TeamGamesWithStats> {
    const supabase = await createClient();
    const query = getTeamGamesQuery(supabase, teamId);
    
    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch team games from database: ${error.message}`);
    }

    return data || [];
  }
}
