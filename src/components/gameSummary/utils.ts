import { IndividualName, PlayerGameStat, GameSummaryData, TeamName } from "@/types";
import { TEAM_ALL, TEAM_NO_BEN, TEAM_NO_TRENTON, TEAM_NO_CODY, TEAM_NO_ISAAC, TEAM_ISAAC_BEN, TEAM_ISAAC_TRENTON, TEAM_ISAAC_CODY } from "@/constants";

export const statKeys = ["kills", "assists", "damage", "rescues", "recalls"];

export const playerMapping: Record<string, IndividualName[]> = {
  [TEAM_ALL]: ["isaac", "cody", "trenton", "ben"],
  [TEAM_NO_BEN]: ["isaac", "cody", "trenton"],
  [TEAM_NO_TRENTON]: ["isaac", "cody", "ben"],
  [TEAM_NO_CODY]: ["isaac", "trenton", "ben"],
  [TEAM_NO_ISAAC]: ["cody", "trenton", "ben"],
  [TEAM_ISAAC_BEN]: ["isaac", "ben"],
  [TEAM_ISAAC_TRENTON]: ["isaac", "trenton"],
  [TEAM_ISAAC_CODY]: ["isaac", "cody"],
};

export interface HighestStat {
  player: IndividualName;
  value: number;
  stat: string;
  gameIndex: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const processGameData = (game: any, team: TeamName): GameSummaryData => {
  const players = playerMapping[team] || [];

  const gamePlayerData: PlayerGameStat[] = players.map(player => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerData: any = { player: player.charAt(0).toUpperCase() + player.slice(1) };
    statKeys.forEach(stat => {
      playerData[stat] = game[`${player}_${stat}` as keyof typeof game] || 0;
    });
    return playerData as PlayerGameStat;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const totalRow: any = { player: 'Total' };
  statKeys.forEach(stat => {
    totalRow[stat] = game[`total_${stat}` as keyof typeof game] || 0;
  });

  return { win: game.win, gameIndex: game.gameIndex, data: [...gamePlayerData, totalRow as PlayerGameStat] };
};
