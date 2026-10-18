-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"category" text NOT NULL,
	"display_name" text NOT NULL,
	"criteria" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "game_player_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"game_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"kills" integer DEFAULT 0,
	"assists" integer DEFAULT 0,
	"damage" integer DEFAULT 0,
	"rescues" integer DEFAULT 0,
	"recalls" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "game_player_stats" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"team_id" uuid NOT NULL,
	"team_sort_order" integer,
	"is_win" boolean,
	"match_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"played_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "games" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "player_team_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"achieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"achievement_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "unique_player_team_achievement" UNIQUE("player_id","team_id","achievement_id")
);
--> statement-breakpoint
ALTER TABLE "player_team_achievements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL CONSTRAINT "players_name_key" UNIQUE,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
	"color" varchar,
	"designation" text,
	"userId" uuid
);
--> statement-breakpoint
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_players" (
	"team_id" uuid,
	"player_id" uuid,
	CONSTRAINT "team_players_pkey" PRIMARY KEY("team_id","player_id")
);
--> statement-breakpoint
ALTER TABLE "team_players" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(255) NOT NULL CONSTRAINT "teams_name_key" UNIQUE,
	"team_type" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_game_player_stats_game" ON "game_player_stats" ("game_id");--> statement-breakpoint
CREATE INDEX "idx_game_player_stats_player" ON "game_player_stats" ("player_id");--> statement-breakpoint
CREATE INDEX "idx_games_team_sort" ON "games" ("team_id","team_sort_order");--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_player_stats" ADD CONSTRAINT "game_player_stats_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_player_stats" ADD CONSTRAINT "game_player_stats_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "player_team_achievements" ADD CONSTRAINT "player_team_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "player_team_achievements" ADD CONSTRAINT "player_team_achievements_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "player_team_achievements" ADD CONSTRAINT "player_team_achievements_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "player_team_achievements" ADD CONSTRAINT "player_team_achievements_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
CREATE VIEW "player_team_avgs" WITH (security_invoker = true) AS (SELECT tp.player_id, t.id AS team_id, t.name AS team_name, avg(gps.kills) AS average_kills, avg(gps.damage) AS average_damage, avg(gps.assists) AS average_assists, avg(gps.rescues) AS average_rescues, avg(gps.recalls) AS average_recalls, count(g.id) AS games_played FROM team_players tp JOIN teams t ON tp.team_id = t.id JOIN games g ON t.id = g.team_id JOIN game_player_stats gps ON g.id = gps.game_id AND tp.player_id = gps.player_id GROUP BY tp.player_id, t.id, t.name);--> statement-breakpoint
CREATE VIEW "player_team_wins" WITH (security_invoker = true) AS (SELECT tp.player_id, t.id AS team_id, t.name AS team_name, count(g.id) AS wins FROM team_players tp JOIN teams t ON tp.team_id = t.id JOIN games g ON t.id = g.team_id WHERE g.is_win = true GROUP BY tp.player_id, t.id, t.name);--> statement-breakpoint
CREATE POLICY "Authenticated can delete" ON "game_player_stats" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "game_player_stats" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "game_player_stats" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "update" ON "game_player_stats" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Authenticated can delete" ON "games" AS PERMISSIVE FOR DELETE TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable insert for authenticated users only" ON "games" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "games" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "update" ON "games" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "players" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "team_players" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Enable read access for all users" ON "teams" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);
