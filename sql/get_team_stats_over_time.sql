
BEGIN
    RETURN QUERY
    WITH TeamGameStats AS (
        -- Calculate the totals for the entire team per game
        SELECT 
            g.id AS game_id,
            g.team_sort_order,
            g.played_at,
            CAST(SUM(COALESCE(gps.kills, 0)) AS integer) AS team_kills,
            CAST(SUM(COALESCE(gps.damage, 0)) AS integer) AS team_damage
        FROM games g
        LEFT JOIN game_player_stats gps ON g.id = gps.game_id
        WHERE g.team_id = p_team_id
        GROUP BY g.id, g.team_sort_order, g.played_at
    ),
    TeamRunningStats AS (
        -- Calculate the running totals and averages for the team
        SELECT 
            tgs.game_id,
            tgs.team_sort_order,
            tgs.played_at,
            SUM(tgs.team_kills) OVER w AS running_team_kills,
            AVG(tgs.team_kills) OVER w AS running_avg_team_kills,
            SUM(tgs.team_damage) OVER w AS running_team_damage,
            AVG(tgs.team_damage) OVER w AS running_avg_team_damage,
            ROW_NUMBER() OVER w AS games_played
        FROM TeamGameStats tgs
        WINDOW w AS (ORDER BY tgs.played_at NULLS FIRST, tgs.team_sort_order ROWS UNBOUNDED PRECEDING)
    ),
    PlayerGameStats AS (
        -- Get individual player stats per game
        SELECT 
            g.id AS game_id,
            g.team_sort_order,
            g.played_at,
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
            pgs.played_at,
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
        WINDOW w AS (PARTITION BY pgs.player_id ORDER BY pgs.played_at NULLS FIRST, pgs.team_sort_order ROWS UNBOUNDED PRECEDING)
    ),
    TeamAveragesOfPlayerAverages AS (
        -- Calculate the average of the player running averages for the exact middle
        SELECT
            prs2.game_id,
            AVG(prs2.running_avg_kills) AS running_avg_team_kills,
            AVG(prs2.running_avg_damage) AS running_avg_team_damage
        FROM PlayerRunningStats prs2
        GROUP BY prs2.game_id
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
        tapa.running_avg_team_kills,
        trs.running_team_damage,
        tapa.running_avg_team_damage,
        prs.running_wins,
        trs.games_played
    FROM PlayerRunningStats prs
    JOIN TeamRunningStats trs ON prs.game_id = trs.game_id
    JOIN TeamAveragesOfPlayerAverages tapa ON prs.game_id = tapa.game_id
    ORDER BY prs.played_at NULLS FIRST, prs.team_sort_order, prs.player_name;
END;
