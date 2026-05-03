import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/services/gameService";
import { z } from "zod";

export const editGamePayloadSchema = z.object({
  isWin: z.boolean(),
  matchType: z.enum(["duo", "squad"]),
  playedAt: z.string().transform((value) => new Date(value)),
  stats: z.array(z.object({
    playerId: z.string(),
    kills: z.number().default(0),
    assists: z.number().default(0),
    damage: z.number().default(0),
    rescues: z.number().default(0),
    recalls: z.number().default(0),
  }))
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = editGamePayloadSchema.parse(body);

    const gameService = new GameService();
    const result = await gameService.updateGame(gameId, parsedBody);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Error in Game PUT API:", error);
      return NextResponse.json({ error: "Invalid payload", details: error }, { status: 400 });
    }
    console.error("Error in Game PUT API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ error: "Game ID is required" }, { status: 400 });
    }

    const gameService = new GameService();
    const result = await gameService.deleteGame(gameId);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error in Game DELETE API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
