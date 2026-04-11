---
name: PUBG Stats Codebase Context
description: Core context about the PUBG Stats application architecture, database schema, data patterns, and user context. Use this skill when modifying architecture, creating new API routes, or fetching data.
---

# PUBG Stats Codebase Context

This skill provides an essential overview of the PUBG Stats application. Always refer to this context when you need to understand how data is structured, stored, and fetched across the stack.

## 1. Database Schema
We use Postgres via Supabase. All historical gameplay data revolves around `games` tied to `teams` and `players`.
- **`players`**: `(id, name, color, designation)` - Core metadata for users/players.
- **`teams`**: `(id, name, team_type)` - Represents a duo or squad team.
- **`team_players`**: Junction table mapping players to teams.
- **`games`**: `(id, team_id, is_win, match_type, team_sort_order, created_at)` - A discrete pubg match.
- **`game_player_stats`**: `(id, game_id, player_id, kills, assists, damage, rescues, recalls)` - Individual player stats for a given game.
**Where to look:** Read `supabase_schema.sql` at the project root for exact DDL statements and foreign key constraints.

## 2. API Calls & SWR (Data Fetching Hook Pattern)
We decouple API fetching from UI components using SWR within custom custom hooks.
- **Location:** `src/hooks/`
- **Pattern:** Components should rarely make direct `fetch()` calls. Instead, we use SWR in hooks like `usePlayer`, `useTeam`, `useDashboard`.
- **Example Usage:**
  ```tsx
  import { usePlayer } from '@/hooks/usePlayer';
  
  export function PlayerProfile({ id }) {
    const { player, isLoading, isError } = usePlayer(id);
    if (isLoading) return <Loading />;
    // ...
  }
  ```
**Where to look:** Look in `src/hooks/` for examples of multiFetchers and SWR caching logic. Look in `src/app/api/` for the Next.js API route definitions serving the JSON.

## 3. Data Structures & Typing
We use **Zod** combined with **TypeScript inference** to define the shape of all objects.
- **Location:** `src/types.ts`
- **Rule:** Never use the `any` type. Always type responses using the exports from `src/types.ts`.
- **Key Data Models (in `types.ts`):**
  - `Player` / `PlayerMetadata` / `PlayerAverages`
  - `Game` / `StatPair`
  - `TeamOverview` / `TeamHallOfFame` / `TeamPersonalBest`
**Where to look:** Always import types from `@/types`. If a field is missing, define it inside the Zod schemas in `src/types.ts` first.

## 4. Stats Collected
We collect specific raw match metrics in the database, and compute several derived stats.
- **Raw Metrics:** `kills`, `assists`, `damage`, `rescues`, `recalls`
- **Derived/Computed Stats:** `winRate`, `avgKills`, `avgDamage`, `killStealing` (often measured as a percentage, tracking kills stolen relative to damage dealt)
- **Names/Constants:** Stats have specific string constants associated with them (e.g. `WIN_RATE_STAT_NAME`, `KILL_STEALING_STAT_NAME`).
**Where to look:** Refer to `src/constants.ts` for stat names, display names, player theme colors, and graph configurations.

## 5. User & Authentication Context
Global context is managed by React Context wrapping Supabase Auth.
- **Location:** `src/contexts/UserContext.tsx`
- **Usage:** Exposes the active user session and auth loading state.
- **Example Usage:**
  ```tsx
  import { useUser } from '@/contexts/UserContext';
  
  const { user, session, isLoading } = useUser();
  ```
**Where to look:** When dealing with access control, authentication, or session specifics, look at `UserContext.tsx` and the `src/lib/supabase/` helper files.

## Summary: Pointers for Deep Context
- **Need to write a new SQL query?** See `supabase_schema.sql` (schema) and `src/app/api/` (where DB clients are used).
- **Need to add a new graph or dashboard component?** See `src/components/`, ensuring you utilize `src/constants.ts` for consistent colors/names.
- **Need to fetch stats?** Browse `src/hooks/` to see if an SWR hook exists, or create a new one.
- **Unsure what a data object looks like?** View `src/types.ts`.
