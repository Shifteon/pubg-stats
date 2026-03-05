create table public.game_player_stats (
  id uuid not null default gen_random_uuid (),
  game_id uuid not null,
  player_id uuid not null,
  kills integer null default 0,
  assists integer null default 0,
  damage integer null default 0,
  rescues integer null default 0,
  recalls integer null default 0,
  constraint game_player_stats_pkey primary key (id),
  constraint game_player_stats_game_id_fkey foreign KEY (game_id) references games (id) on delete CASCADE,
  constraint game_player_stats_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_game_player_stats_player on public.game_player_stats using btree (player_id) TABLESPACE pg_default;

create index IF not exists idx_game_player_stats_game on public.game_player_stats using btree (game_id) TABLESPACE pg_default;

create table public.games (
  id uuid not null default gen_random_uuid (),
  team_id uuid not null,
  team_sort_order integer not null,
  is_win boolean null,
  match_type character varying(50) not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint games_pkey primary key (id),
  constraint games_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_games_team_sort on public.games using btree (team_id, team_sort_order) TABLESPACE pg_default;

create table public.players (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  color character varying null,
  designation text null,
  constraint players_pkey primary key (id),
  constraint players_name_key unique (name)
) TABLESPACE pg_default;

create table public.team_players (
  team_id uuid not null,
  player_id uuid not null,
  constraint team_players_pkey primary key (team_id, player_id),
  constraint team_players_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE,
  constraint team_players_team_id_fkey foreign KEY (team_id) references teams (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.teams (
  id uuid not null default gen_random_uuid (),
  name character varying(255) not null,
  team_type character varying(50) not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint teams_pkey primary key (id),
  constraint teams_name_key unique (name)
) TABLESPACE pg_default;
