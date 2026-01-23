import { AggregatedStats } from "./statHelpers";

type BestStatConfig = {
  label: string;
  key: string;
  value: number;
};

const STAT_LABELS: Record<string, string> = {
  avgDamage: "Avg Damage",
  avgKills: "Avg Kills",
  winRate: "Win Rate",
  avgAssists: "Avg Assists",
  avgRescues: "Avg Rescues",
  avgRecalls: "Avg Recalls",
};

const STAT_PRIORITY = [
  "avgKills",
  "avgDamage",
  "winRate",
  "avgAssists",
  "avgRescues",
  "avgRecalls",
];

// Calculate simple averages from the aggregated data structure we know
// We need to re-implement the aggregation logic here or assume 'data' passed in 
// has the calculated stats. 
// However, PlayerAggregatedData returns { data: ..., allGames: ... }
// The 'aggregatedStats' object (avgDamage, etc.) is currently calculated INSIDE the hook/component.
// We should extract that aggregation logic to a shared helper so we can reuse it here without duplicating code.

export const calculateBestStats = (
  playerStats: Record<string, AggregatedStats>
): Record<string, BestStatConfig> => {
  const players = Object.keys(playerStats);
  const assignments: Record<string, BestStatConfig> = {};
  const availableStats = new Set(STAT_PRIORITY);
  const unassignedPlayers = new Set(players);

  // Helper to get score (0-1)
  const getScore = (statKey: string, value: number) => {
    let max = 0;
    for (const p of players) {
      const pVal = playerStats[p][statKey as keyof AggregatedStats] || 0;
      if (pVal > max) max = pVal;
    }
    return max === 0 ? 0 : value / max;
  };

  // Iterative greedy assignment
  while (unassignedPlayers.size > 0 && availableStats.size > 0) {
    let bestCandidate = { player: "", stat: "", score: -1, value: 0 };

    // Find the best remaining player-stat pair
    for (const player of unassignedPlayers) {
      for (const stat of availableStats) {
        const value = playerStats[player][stat as keyof AggregatedStats] || 0;
        const score = getScore(stat, value);

        // Prioritize by score, then by stat priority (index in array)
        if (score > bestCandidate.score) {
          bestCandidate = { player, stat, score, value };
        } else if (score === bestCandidate.score) {
          // Tie-breaking: Use priority index
          const currentIdx = STAT_PRIORITY.indexOf(stat);
          const bestIdx = STAT_PRIORITY.indexOf(bestCandidate.stat);
          if (currentIdx < bestIdx && currentIdx !== -1) {
            bestCandidate = { player, stat, score, value };
          }
        }
      }
    }

    if (bestCandidate.player) {
      assignments[bestCandidate.player] = {
        label: STAT_LABELS[bestCandidate.stat],
        key: bestCandidate.stat,
        value: bestCandidate.value
      };
      unassignedPlayers.delete(bestCandidate.player);
      availableStats.delete(bestCandidate.stat);
    } else {
      break; // Should not happen if availableStats > 0
    }
  }

  // Fallback for any unassigned players (if ran out of stats, though unlikely with 4 players and 6 stats)
  // Just pick their best remaining local stat without removing it from others (since "off the table" logic is done)
  // Or relaxed rule: "try to find a stat that is higher than most" -> we can reuse stats if needed?
  // "each player ... will have that as their best stat, that stat is now off the table"
  // If we run out of unique stats, we might have to reuse.
  if (unassignedPlayers.size > 0) {
    for (const player of unassignedPlayers) {
      // Find their personal best stat (highest score) from ALL stats (ignoring availability)
      let best = { stat: "avgDamage", score: -1, value: 0 };
      for (const stat of STAT_PRIORITY) {
        const value = playerStats[player][stat as keyof AggregatedStats] || 0;
        const score = getScore(stat, value);
        if (score > best.score) {
          best = { stat, score, value };
        }
      }
      assignments[player] = {
        label: STAT_LABELS[best.stat],
        key: best.stat,
        value: best.value
      };
    }
  }

  return assignments;
};
