---
name: Safe Database Migrations
description: Guides agents through safely creating, testing, and typing Supabase database migrations locally without ever pushing to remote databases. Use this skill when modifying database schema, creating tables, views, functions, RLS policies, or migrations.
---

# Safe Database Migrations Workflow

This skill outlines the strict, safe procedure for creating, testing, and synchronizing database changes in `pubg-stats`.

---

> [!CAUTION]
> ### THE CARDINAL RULE: NEVER RUN `db:push` OR TARGET REMOTE VIA `--linked` / `--db-url`
> **NEVER** run `npm run db:push`, `supabase db push`, or pass `--linked` or `--db-url` to any command (especially `db reset`, `migration down`, or `migration up`).
> 
> * Agents are **strictly forbidden** from applying changes to or resetting remote databases. All commands must be strictly constrained with `--local`.
> * Database deployments and remote operations carry risk of data loss or schema locking and must **always be left to the user's manual review and judgment** (or automated through a verified merge-to-main CI/CD pipeline).
> * The agent's responsibility ends after:
>   1. Creating the migration file in `supabase/migrations/`
>   2. Verifying and replaying migrations locally via `npm run db:reset` (or `npm run db:up`)
>   3. Linting via `npm run db:lint`
>   4. Synchronizing and verifying TypeScript types via `npm run db:types`
>   5. Presenting the change for user review

---

## 1. Local Environment Management

Supabase migrations must be developed and validated against the local Docker stack before committing.

* **Start local Supabase stack**:
  ```bash
  npm run db:start
  ```
* **Check local URLs and service status**:
  ```bash
  npm run db:status
  ```
  *(Local Studio runs at `http://localhost:54323`, Postgres on port `54322`, API on `54321`)*
* **Stop local Supabase stack** (when finished):
  ```bash
  npm run db:stop
  ```

---

## 2. Creating a Migration

All database modifications must be captured in timestamped SQL files under `supabase/migrations/`.

### Option A: Manual / Scripted SQL (Preferred for functions, views, policies)
1. Create a new migration file:
   ```bash
   npm run db:new -- <descriptive_migration_name>
   ```
   *Example:*
   ```bash
   npm run db:new -- add_player_achievements_table
   ```
2. Open the newly generated file in `supabase/migrations/<timestamp>_<descriptive_migration_name>.sql`.
3. Write clean, idempotent PostgreSQL DDL:
   * Use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, or `CREATE OR REPLACE FUNCTION`.
   * Follow the **Expand and Contract pattern**: Add columns with `DEFAULT` or `NULL` so existing application code does not break.
   * Enable Row Level Security (RLS) on all newly created tables:
     ```sql
     ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
     ```

### Option B: Visual Diff (When tweaking via local Supabase Studio)
1. Make your changes in local Studio at `http://localhost:54323`.
2. Generate the migration file from the diff against the shadow database:
   ```bash
   npm run db:diff -- <descriptive_migration_name>
   ```
3. Inspect and format the generated SQL in `supabase/migrations/`.

---

## 3. Testing Migrations Locally

Always verify that migrations can be replayed cleanly from scratch without breaking existing data structures.

### Step 1: Replay All Migrations (`db:reset`) or Apply Incrementally (`db:up`)
* **Full Verification (`npm run db:reset`)**: Drops the local database, reruns all migration files in `supabase/migrations/` in ascending timestamp order, and applies `supabase/seed.sql` (if present).
  * *Success criteria*: Must exit with code 0. Guarantees that the entire migration history is reproducible from scratch.
* **Incremental Application (`npm run db:up`)**: Applies only unapplied/pending migrations to your local database, preserving existing local tables and test data.
  * *Use case*: When testing incremental changes or pulling updates from git without wiping local test data.

### Step 2: Database Linting (`db:lint`)
Run:
```bash
npm run db:lint
```
* Identifies security vulnerabilities, missing RLS policies, unindexed foreign keys, or dangerous function permissions. Resolve any reported warnings before finishing.

---

## 4. Keeping Types in Sync

Whenever schema, views, or RPC functions are updated, TypeScript definitions must be regenerated.

1. **Regenerate types from the local database**:
   ```bash
   npm run db:types
   ```
   This updates `src/types/database.types.ts` with the exact Postgres schema types.

2. **Verify application types**:
   * Refer to `src/types.ts` or `src/types/`.
   * **STRICT RULE**: Adhere to `.agents/rules/explicit-any.md`. Never use `any` when handling Supabase responses or database rows. Use generated types (e.g. `Tables<'game_player_stats'>`) or Zod schema inference.

3. **Verify typecheck passes**:
   ```bash
   npm run build
   ```
   Ensure no Next.js API routes, server actions, or UI components have type errors against the updated database schema.

---

## 5. Handoff to the User

Once local testing and type synchronization are complete:
1. Explain the changes made in the migration file.
2. Confirm that `npm run db:reset`, `npm run db:lint`, and `npm run db:types` passed locally.
3. Inform the user that they may inspect the migration and deploy it when ready (e.g. using `npm run db:push` or committing to trigger CI/CD).
4. **DO NOT run `db:push` yourself.**
