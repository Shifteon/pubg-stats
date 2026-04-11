import { createAgentUIStreamResponse } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { createPubgAgent } from '@/lib/agents/pubgAgent';

export const maxDuration = 120; // Allow 120s max for AI, in case of large responses or timeouts

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, userId, userEmail } = body;
  
  const supabase = await createClient();
  let userInfo = "Anonymous user.";
  if (userId) {
    const { data: player } = await supabase.from("players").select("*").eq("userId", userId).single();
    if (player) {
      userInfo = `The user you are talking to is mapped to player: ${player.name}. Their playerId is ${player.id}. You MUST refer to them by their name and use this playerId when looking up "my" stats.`;
    } else {
       userInfo = `The user is logged in with email ${userEmail}, but they are not linked to a player profile in the database.`;
    }
  }

  const systemPrompt = `You are a helpful AI assistant for a PUBG Stats website.
Your purpose is to answer questions about user performance, team performance, and match history.
${userInfo}

Terminology & DB Info:
- Players can be on multiple teams.
- Teams have games.
- Games contain a played_at date. (Games before Feb 28, 2026 don't have played_at, rely on team_sort_order instead).
- Match types are "squad" or "duo".
- kills, assists, damage, rescues, recalls are the basic collected stats.
- Kill stealing means getting a kill on someone you did little damage to, or finishing someone that a teammate knocked. 
- You can perform inferences and computation with the data you fetch (e.g. you can calculate kill steals by analyzing game stats).

When users ask about their stats, ALWAYS use the provided tools to query the database. Do not hallucinate data.

Rules:
1. Try to be very concise and conversational unless the user asks for a detailed breakdown.
2. If the user asks about the "last time they played", fetch their games and look at the most recent one.
`;

  const baseUrl = new URL("/", req.url).toString();
  
  // Forward cookies from the incoming request so the internal fetch calls made by tools
  // can bypass RLS as the same authenticated user.
  const headers: Record<string, string> = {};
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    headers["cookie"] = cookieHeader;
  }

  const agent = createPubgAgent(baseUrl, systemPrompt, headers);

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
