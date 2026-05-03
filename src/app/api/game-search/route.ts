import { generateText, Output } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const supabase = await createClient();
    let userInstruction = "";
    if (userId) {
      const { data: player } = await supabase.from("players").select("*").eq("userId", userId).single();
      if (player) {
        userInstruction = `\n7. If the user refers to themselves ("I", "my", "me"), their player name is "${player.name}". Use "${player.name}" for the player filter in this case.`;
      }
    }

    const { output } = await generateText({
      model: 'google/gemini-2.5-flash',
      system: `You are an AI assistant that translates natural language into structured filters for a PUBG game search feature.
      
The available stats are: "kills", "assists", "damage", "rescues", "recalls".
The operators are: ">=", "<=", "=".

Rules:
1. Always use the exact stat names (lowercase).
2. If the user says "we", "our", "team", "us", or "total", use "Total" for the player.
3. If the user specifies a specific player name, capitalize the first letter (e.g. "Bob").
4. If the user specifies a win or loss (e.g. "games we won", "lost games"), set resultFilter to "win" or "loss". Otherwise "all".
5. For sorts (e.g. "highest kills", "most damage"), set the sortConfig. The default direction is "desc" unless they ask for "lowest" or "worst".
6. Extract any relevant filters. For example, "over 500 damage" is { stat: "damage", operator: ">=", value: 500 }.${userInstruction}`,
      prompt: query,
      output: Output.object({
        schema: z.object({
          filters: z.array(z.object({
            player: z.string().describe('The name of the player, or "Total" for the whole team.'),
            stat: z.enum(["kills", "assists", "damage", "rescues", "recalls"]),
            operator: z.enum([">=", "<=", "="]),
            value: z.number()
          })).optional(),
          sortConfig: z.object({
            player: z.string().describe('The name of the player, or "Total" for the whole team.'),
            stat: z.enum(["kills", "assists", "damage", "rescues", "recalls"]),
            direction: z.enum(["asc", "desc"])
          }).nullable().optional(),
          resultFilter: z.enum(["all", "win", "loss"]).optional()
        })
      })
    });

    return NextResponse.json({
      filters: output.filters || [],
      sortConfig: output.sortConfig || null,
      resultFilter: output.resultFilter || "all"
    });
  } catch (error) {
    console.error("Game search error:", error);
    return NextResponse.json({ error: "Failed to generate search query" }, { status: 500 });
  }
}
