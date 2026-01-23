
import { useState, useEffect, useMemo } from "react";
import { PlayerAggregatedData, PlayerStat, PlayerTeamStats } from "@/stats/playerStat";
import {
  AVATAR_SRC_MAP,
  PLAYER_DESIGNATIONS,
  TEAM_DISPLAY_NAMES,
  ISAAC_LOWERCASE,
  CODY_LOWERCASE,
  BEN_LOWERCASE,
  TRENTON_LOWERCASE,
} from "@/constants";
import { calculateAggregatedStats, AggregatedStats } from "@/utils/statHelpers";
import { calculateBestStats } from "@/utils/bestStatLogic";

const PLAYER_NAMES = [ISAAC_LOWERCASE, CODY_LOWERCASE, BEN_LOWERCASE, TRENTON_LOWERCASE];

type BestStatConfig = {
  label: string;
  key: string;
  value: number;
};

export const usePlayerStatsData = (playerName: string) => {
  const [data, setData] = useState<PlayerAggregatedData | null>(null);
  const [bestStat, setBestStat] = useState<BestStatConfig | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const normalizedName = playerName.toLowerCase();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const statService = new PlayerStat();

        // Fetch specific player data
        const result = await statService.getStats(normalizedName);
        setData(result);

        // Fetch ALL players to compare and determine dynamic best stat
        const allPlayersData = await Promise.all(
          PLAYER_NAMES.map(p => statService.getStats(p))
        );

        // Map player names to their aggregated stats
        const playerStatsMap: Record<string, AggregatedStats> = {};
        PLAYER_NAMES.forEach((p, index) => {
          playerStatsMap[p] = calculateAggregatedStats(allPlayersData[index], p);
        });

        // Calculate best stats for everyone
        const calculatedBestStats = calculateBestStats(playerStatsMap);

        // Set the best stat for the current player
        if (calculatedBestStats[normalizedName]) {
          setBestStat(calculatedBestStats[normalizedName]);
        }

      } catch (e) {
        console.error("Failed to load player stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [normalizedName]);

  const designation = PLAYER_DESIGNATIONS[normalizedName] || "Player";
  const avatarSrc = AVATAR_SRC_MAP[normalizedName];

  const aggregatedStats = useMemo(() => {
    if (!data) return {
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
    return calculateAggregatedStats(data, playerName);
  }, [data, playerName]);

  const mostPlayedTeam = useMemo(() => {
    if (!data || !data.data || data.data.length === 0) return null;

    // Find the team with the max gamesPlayed
    return data.data.reduce((prev, current) => {
      return (prev.gamesPlayed > current.gamesPlayed) ? prev : current;
    }, data.data[0] as PlayerTeamStats);
  }, [data]);

  const signatureStatConfig = bestStat || { label: "Avg Damage", key: "avgDamage", value: 0 };
  const signatureStatValue = bestStat ? bestStat.value : (aggregatedStats[signatureStatConfig.key as keyof typeof aggregatedStats] || 0);

  const mostPlayedTeamName = mostPlayedTeam
    ? (TEAM_DISPLAY_NAMES[mostPlayedTeam.teamName] || mostPlayedTeam.teamName)
    : "N/A";

  const formatValue = (key: string, value: number) => {
    if (key === 'winRate') return `${value.toFixed(1)}%`;
    return typeof value === 'number' ? value.toFixed(1) : value;
  };

  return {
    loading,
    data,
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
