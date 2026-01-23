
import { useMemo } from "react";
import { PlayerAggregatedData, PlayerTeamStats } from "@/stats/playerStat";
import {
  AVATAR_SRC_MAP,
  PLAYER_DESIGNATIONS,
  ISAAC_LOWERCASE,
  CODY_LOWERCASE,
  BEN_LOWERCASE,
  TRENTON_LOWERCASE,
  TEAM_DISPLAY_NAMES,
} from "@/constants";

const SIGNATURE_STAT_MAP: Record<string, { label: string, key: 'avgDamage' | 'avgKills' | 'winRate' }> = {
  [ISAAC_LOWERCASE]: { label: "Avg Kills", key: "avgKills" },
  [CODY_LOWERCASE]: { label: "Win Rate", key: "winRate" },
  [BEN_LOWERCASE]: { label: "Avg Kills", key: "avgKills" },
  [TRENTON_LOWERCASE]: { label: "Avg Damage", key: "avgDamage" },
};

export const usePlayerStatsData = (data: PlayerAggregatedData, playerName: string) => {
  const normalizedName = playerName.toLowerCase();
  const designation = PLAYER_DESIGNATIONS[normalizedName] || "Player";
  const avatarSrc = AVATAR_SRC_MAP[normalizedName];

  const aggregatedStats = useMemo(() => {
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
  }, [data.allGames, normalizedName]);

  const mostPlayedTeam = useMemo(() => {
    if (!data.data || data.data.length === 0) return null;

    // Find the team with the max gamesPlayed
    return data.data.reduce((prev, current) => {
      return (prev.gamesPlayed > current.gamesPlayed) ? prev : current;
    }, data.data[0] as PlayerTeamStats);
  }, [data.data]);

  const signatureStatConfig = SIGNATURE_STAT_MAP[normalizedName] || { label: "Avg Damage", key: "avgDamage" };
  const signatureStatValue = aggregatedStats[signatureStatConfig.key];

  const mostPlayedTeamName = mostPlayedTeam
    ? (TEAM_DISPLAY_NAMES[mostPlayedTeam.teamName] || mostPlayedTeam.teamName)
    : "N/A";

  const formatValue = (key: string, value: number) => {
    if (key === 'winRate') return `${value.toFixed(1)}%`;
    return value.toFixed(1);
  };

  return {
    normalizedName,
    designation,
    avatarSrc,
    aggregatedStats,
    mostPlayedTeam,
    signatureStatConfig,
    signatureStatValue,
    mostPlayedTeamName,
    formatValue
  };
};
