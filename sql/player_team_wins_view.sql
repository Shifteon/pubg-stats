CREATE OR REPLACE VIEW player_team_wins AS
SELECT 
  tp.player_id,
  t.id as team_id,
  t.name as team_name,
  COUNT(g.id) as wins
FROM team_players tp
JOIN teams t ON tp.team_id = t.id
JOIN games g ON t.id = g.team_id
WHERE g.is_win = true
GROUP BY tp.player_id, t.id, t.name;

GRANT SELECT ON TABLE player_team_wins TO anon, authenticated, service_role;