import { PlayerAggregatedData } from "@/stats/playerStat";

export interface AggregatedStats {
  avgDamage: number;
  avgKills: number;
  winRate: number;
  gamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  avgAssists: number;
  avgRescues: number;
  avgRecalls: number;
}

export const calculateAggregatedStats = (data: PlayerAggregatedData, playerName: string): AggregatedStats => {
  const normalizedName = playerName.toLowerCase();
  const games = data.allGames;

  if (!games || games.length === 0) {
    return {
      avgDamage: 0,
      avgKills: 0,
      winRate: 0,
      gamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      avgAssists: 0,
      avgRescues: 0,
      avgRecalls: 0,
    };
  }

  let totalDamage = 0;
  let totalKills = 0;
  let totalWins = 0;
  let totalAssists = 0;
  let totalRescues = 0;
  let totalRecalls = 0;
  let count = 0;

  games.forEach(game => {
    const damageKey = `${normalizedName}_damage`;
    const killsKey = `${normalizedName}_kills`;
    const assistsKey = `${normalizedName}_assists`;
    const rescuesKey = `${normalizedName}_rescues`;
    const recallsKey = `${normalizedName}_recalls`;

    const damage = Number(game[damageKey]) || 0;
    const kills = Number(game[killsKey]) || 0;
    const assists = Number(game[assistsKey]) || 0;
    const rescues = Number(game[rescuesKey]) || 0;
    const recalls = Number(game[recallsKey]) || 0;
    const win = Number(game['win']) || 0;

    totalDamage += damage;
    totalKills += kills;
    totalAssists += assists;
    totalRescues += rescues;
    totalRecalls += recalls;
    totalWins += win;
    count++;
  });

  return {
    avgDamage: totalDamage / count,
    avgKills: totalKills / count,
    winRate: (totalWins / count) * 100, // Percentage
    gamesPlayed: count,
    totalWins,
    totalLosses: count - totalWins,
    avgAssists: totalAssists / count,
    avgRescues: totalRescues / count,
    avgRecalls: totalRecalls / count,
  };
};
