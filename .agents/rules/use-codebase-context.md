---
description: Ensure the AI reads the overarching codebase context to understand architecture, schemas, and patterns before starting a complex task.
globs: *
---

# Use Codebase Context

When beginning a new task that involves interacting with the database, dealing with state/app data, or extending functionality across files, you MUST read the codebase context first to ensure you understand our architectural standards.

1. **Check the codebase context skill:**
   Read `c:\Users\bpwya\Documents\projects\pubg\pubg-stats\.agents\skills\codebase-context\SKILL.md` (or simply use the `codebase-context` skill if available via tools).
2. **Key guarantees:**
   - It will explain the Supabase Postgres schema.
   - It details SWR usage and how our custom hooks map to the Next.js API layer.
   - It covers the data typing with Zod in `types.ts`.
   - It outlines available metrics and stats defined in `constants.ts`.
   - It covers the user authentication via `UserContext.tsx`.

Do not attempt to write direct fetch layers inside UI components or invent new data structures without checking `types.ts` and `constants.ts` first.
