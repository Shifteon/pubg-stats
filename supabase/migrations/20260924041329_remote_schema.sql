SET local check_function_bodies = off;

CREATE TABLE "public"."achievements" (
  "id"           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "category"     text                     NOT NULL,
  "display_name" text                     NOT NULL,
  "criteria"     jsonb                    NOT NULL,
  CONSTRAINT "achievements_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."achievements"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."game_player_stats" (
  "id"        uuid    NOT NULL DEFAULT gen_random_uuid(),
  "game_id"   uuid    NOT NULL,
  "player_id" uuid    NOT NULL,
  "kills"     integer DEFAULT 0,
  "assists"   integer DEFAULT 0,
  "damage"    integer DEFAULT 0,
  "rescues"   integer DEFAULT 0,
  "recalls"   integer DEFAULT 0,
  CONSTRAINT "game_player_stats_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."game_player_stats"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."games" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "team_id"         uuid                     NOT NULL,
  "team_sort_order" integer,
  "is_win"          boolean,
  "match_type"      character varying(50)    NOT NULL,
  "created_at"      timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "played_at"       timestamp with time zone,
  CONSTRAINT "games_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."games"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."player_team_achievements" (
  "id"             uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "player_id"      uuid                     NOT NULL,
  "team_id"        uuid                     NOT NULL,
  "achieved_at"    timestamp with time zone NOT NULL DEFAULT now(),
  "achievement_id" uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "game_id"        uuid                     NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT "player_team_achievements_pkey" PRIMARY KEY (id),
  CONSTRAINT "unique_player_team_achievement" UNIQUE (player_id, team_id, achievement_id)
);

ALTER TABLE "public"."player_team_achievements"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."players" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"        character varying(255)   NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "color"       character varying,
  "designation" text,
  "userId"      uuid,
  CONSTRAINT "players_name_key" UNIQUE (name),
  CONSTRAINT "players_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."players"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."team_players" (
  "team_id"   uuid NOT NULL,
  "player_id" uuid NOT NULL,
  CONSTRAINT "team_players_pkey" PRIMARY KEY (team_id, player_id)
);

ALTER TABLE "public"."team_players"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."teams" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "name"       character varying(255)   NOT NULL,
  "team_type"  character varying(50)    NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "teams_name_key" UNIQUE (name),
  CONSTRAINT "teams_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."teams"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_team_stats_over_time (
  p_team_id uuid
)
  RETURNS TABLE (
    game_id                 uuid,
    team_sort_order         integer,
    is_win                  boolean,
    player_id               uuid,
    player_name             character varying,
    kills                   integer,
    damage                  integer,
    running_sum_kills       bigint,
    running_avg_kills       numeric,
    running_sum_damage      bigint,
    running_avg_damage      numeric,
    running_team_kills      bigint,
    running_avg_team_kills  numeric,
    running_team_damage     bigint,
    running_avg_team_damage numeric,
    running_wins            bigint,
    games_played            bigint
  )
  LANGUAGE plpgsql
  AS $function$BEGIN
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
END;$function$;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

ALTER TABLE "public"."game_player_stats"
  ADD CONSTRAINT "game_player_stats_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_team_achievements"
  ADD CONSTRAINT "player_team_achievements_achievement_id_fkey" FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."player_team_achievements"
  ADD CONSTRAINT "player_team_achievements_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."game_player_stats"
  ADD CONSTRAINT "game_player_stats_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_team_achievements"
  ADD CONSTRAINT "player_team_achievements_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."players"
  ADD CONSTRAINT "players_userId_fkey" FOREIGN KEY ("userId") REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE "public"."team_players"
  ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;

ALTER TABLE "public"."games"
  ADD CONSTRAINT "games_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE "public"."player_team_achievements"
  ADD CONSTRAINT "player_team_achievements_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE "public"."team_players"
  ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;

CREATE VIEW "public"."player_team_avgs" WITH (security_invoker=on) AS  SELECT tp.player_id,
    t.id AS team_id,
    t.name AS team_name,
    avg(gps.kills) AS average_kills,
    avg(gps.damage) AS average_damage,
    avg(gps.assists) AS average_assists,
    avg(gps.rescues) AS average_rescues,
    avg(gps.recalls) AS average_recalls,
    count(g.id) AS games_played
   FROM (((public.team_players tp
     JOIN public.teams t ON ((tp.team_id = t.id)))
     JOIN public.games g ON ((t.id = g.team_id)))
     JOIN public.game_player_stats gps ON (((g.id = gps.game_id) AND (tp.player_id = gps.player_id))))
  GROUP BY tp.player_id, t.id, t.name;

CREATE VIEW "public"."player_team_wins" WITH (security_invoker=on) AS  SELECT tp.player_id,
    t.id AS team_id,
    t.name AS team_name,
    count(g.id) AS wins
   FROM ((public.team_players tp
     JOIN public.teams t ON ((tp.team_id = t.id)))
     JOIN public.games g ON ((t.id = g.team_id)))
  WHERE (g.is_win = true)
  GROUP BY tp.player_id, t.id, t.name;

CREATE INDEX idx_game_player_stats_game ON public.game_player_stats USING btree (game_id);

CREATE INDEX idx_game_player_stats_player ON public.game_player_stats USING btree (player_id);

CREATE INDEX idx_games_team_sort ON public.games USING btree (team_id, team_sort_order);

CREATE POLICY "Authenticated can delete" ON "public"."game_player_stats"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."game_player_stats"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_player_stats"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "update" ON "public"."game_player_stats"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete" ON "public"."games"
  FOR DELETE
  TO "authenticated"
  USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."games"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."games"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "update" ON "public"."games"
  FOR UPDATE
  TO "authenticated"
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON "public"."players"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."team_players"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."teams"
  FOR SELECT
  TO "authenticated"
  USING (true);

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

GRANT EXECUTE ON FUNCTION "public"."get_team_stats_over_time"(uuid) TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT EXECUTE ON FUNCTION "public"."rls_auto_enable"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."achievements" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."game_player_stats" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."games" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."player_team_achievements" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."players" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."team_players" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."teams" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."player_team_avgs" TO "anon", "authenticated", "postgres", "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."player_team_wins" TO "anon", "authenticated", "postgres", "service_role";

