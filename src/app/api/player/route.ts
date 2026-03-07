import { supabase } from "@/lib/supabase";
import { playerMetadataSchema } from "@/types";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET() {
  const { data: players, error } = await supabase.from("players").select(`
    id,
    name,
    color,
    designation
  `);

  if (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
  }

  const playerData = z.array(playerMetadataSchema).parse(players);

  return NextResponse.json(playerData);
}
