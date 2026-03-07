DROP FUNCTION IF EXISTS get_team_stats_over_time;

CREATE OR REPLACE FUNCTION get_team_stats_over_time(p_team_id uuid)
RETURNS TABLE (
    game_id uuid,
    team_sort_order integer,
    is_win boolean,
    player_id uuid,
    player_name varchar,
    kills integer,
    damage integer,
    running_sum_kills bigint,
    running_avg_kills numeric,
    running_sum_damage bigint,
    running_avg_damage numeric,
    running_team_kills bigint,
    running_avg_team_kills numeric,
    running_team_damage bigint,
    running_avg_team_damage numeric,
    running_wins bigint,
    games_played bigint
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH TeamGameStats AS (
        -- Calculate the totals for the entire team per game
        SELECT 
            g.id AS game_id,
            g.team_sort_order,
            CAST(SUM(COALESCE(gps.kills, 0)) AS integer) AS team_kills,
            CAST(SUM(COALESCE(gps.damage, 0)) AS integer) AS team_damage
        FROM games g
        LEFT JOIN game_player_stats gps ON g.id = gps.game_id
        WHERE g.team_id = p_team_id
        GROUP BY g.id, g.team_sort_order
    ),
    TeamRunningStats AS (
        -- Calculate the running totals and averages for the team
        SELECT 
            tgs.game_id,
            tgs.team_sort_order,
            SUM(tgs.team_kills) OVER w AS running_team_kills,
            AVG(tgs.team_kills) OVER w AS running_avg_team_kills,
            SUM(tgs.team_damage) OVER w AS running_team_damage,
            AVG(tgs.team_damage) OVER w AS running_avg_team_damage,
            ROW_NUMBER() OVER w AS games_played
        FROM TeamGameStats tgs
        WINDOW w AS (ORDER BY tgs.team_sort_order ROWS UNBOUNDED PRECEDING)
    ),
    PlayerGameStats AS (
        -- Get individual player stats per game
        SELECT 
            g.id AS game_id,
            g.team_sort_order,
            g.is_win,
            p.id AS player_id,
            p.name AS player_name,
            COALESCE(gps.kills, 0) AS kills,
            COALESCE(gps.damage, 0) AS damage
        FROM games g
        JOIN game_player_stats gps ON g.id = gps.game_id
        JOIN players p ON gps.player_id = p.id
        WHERE g.team_id = p_team_id
    ),
    PlayerRunningStats AS (
        -- Calculate the running totals and averages for each player
        SELECT 
            pgs.game_id,
            pgs.team_sort_order,
            pgs.is_win,
            pgs.player_id,
            pgs.player_name,
            pgs.kills,
            pgs.damage,
            SUM(pgs.kills) OVER w AS running_sum_kills,
            AVG(pgs.kills) OVER w AS running_avg_kills,
            SUM(pgs.damage) OVER w AS running_sum_damage,
            AVG(pgs.damage) OVER w AS running_avg_damage,
            SUM(CASE WHEN pgs.is_win THEN 1 ELSE 0 END) OVER w AS running_wins,
            -- Note: games_played_by_player is just row_number partitioned by player
            ROW_NUMBER() OVER w AS games_played_by_player
        FROM PlayerGameStats pgs
        WINDOW w AS (PARTITION BY pgs.player_id ORDER BY pgs.team_sort_order ROWS UNBOUNDED PRECEDING)
    )
    SELECT 
        prs.game_id,
        prs.team_sort_order,
        prs.is_win,
        prs.player_id,
        prs.player_name,
        prs.kills,
        prs.damage,
        prs.running_sum_kills,
        prs.running_avg_kills,
        prs.running_sum_damage,
        prs.running_avg_damage,
        trs.running_team_kills,
        trs.running_avg_team_kills,
        trs.running_team_damage,
        trs.running_avg_team_damage,
        prs.running_wins,
        trs.games_played
    FROM PlayerRunningStats prs
    JOIN TeamRunningStats trs ON prs.game_id = trs.game_id
    ORDER BY prs.team_sort_order, prs.player_name;
END;