CREATE OR REPLACE VIEW player_team_avgs AS
SELECT 
  tp.player_id,
  t.id as team_id,
  t.name as team_name,
  AVG(gps.kills) as average_kills,
  AVG(gps.damage) as average_damage,
  AVG(gps.assists) as average_assists,
  AVG(gps.rescues) as average_rescues,
  AVG(gps.recalls) as average_recalls,
  COUNT(g.id) as games_played
FROM team_players tp
JOIN teams t ON tp.team_id = t.id
JOIN games g ON t.id = g.team_id
JOIN game_player_stats gps ON g.id = gps.game_id AND tp.player_id = gps.player_id
GROUP BY tp.player_id, t.id, t.name;

GRANT SELECT ON TABLE player_team_avgs TO anon, authenticated, service_role;