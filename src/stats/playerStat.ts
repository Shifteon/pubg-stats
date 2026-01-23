import {
  TEAM_MEMBER_MAP,
  VALID_TEAM_NAMES,
} from "@/constants";
import { AverageDamageStat } from "./averageDamageStat";
import { AverageKillsStat } from "./averageKillsStat";
import { WinRateStat } from "./winrateStat";
import { GameSummaryStat } from "./gameSummaryStat";
import { TeamName } from "@/types";

export interface PlayerTeamStats {
  teamName: string;
  avgDamage: number;
  avgKills: number;
  winRate: number;
  gamesPlayed: number;
}

export interface PlayerAggregatedData {
  data: PlayerTeamStats[];
  allGames: Record<string, number>[];
}

export class PlayerStat {
  private avgDamageStat: AverageDamageStat;
  private avgKillsStat: AverageKillsStat;
  private winRateStat: WinRateStat;
  private gameSummaryStat: GameSummaryStat;

  constructor() {
    this.avgDamageStat = new AverageDamageStat();
    this.avgKillsStat = new AverageKillsStat();
    this.winRateStat = new WinRateStat();
    this.gameSummaryStat = new GameSummaryStat();
  }

  public async getStats(playerName: string): Promise<PlayerAggregatedData> {
    const playerTeams = VALID_TEAM_NAMES.filter(team => {
      const members = TEAM_MEMBER_MAP[team];
      return members && members.includes(playerName.toLowerCase());
    });

    const statsPromises = playerTeams.map(async (team) => {
      const [damageData, killsData, winRateData, gameSummaryData] = await Promise.all([
        this.avgDamageStat.getStats(team),
        this.avgKillsStat.getStats(team),
        this.winRateStat.getStats(team),
        this.gameSummaryStat.getStats(team as TeamName)
      ]);

      const playerDamageKey = `${playerName.toLowerCase()}_damage`;
      const playerKillsKey = `${playerName.toLowerCase()}_kills`;

      let currentAvgDamage = 0;
      let currentAvgKills = 0;
      let gamesCount = 0;
      let currentWinRate = 0;

      if (damageData && damageData.data.length > 0) {
        gamesCount = damageData.data.length;
        const lastGame = damageData.data[damageData.data.length - 1];
        currentAvgDamage = lastGame[playerDamageKey] || 0;
      }

      if (killsData && killsData.data.length > 0) {
        const lastGame = killsData.data[killsData.data.length - 1];
        currentAvgKills = lastGame[playerKillsKey] || 0;
      }

      if (winRateData && winRateData.data.length > 0) {
        const lastEntry = winRateData.data[winRateData.data.length - 1];
        currentWinRate = lastEntry ? (lastEntry['win_rate'] || lastEntry['winrate'] || 0) : 0;
      }

      return {
        teamName: team,
        avgDamage: currentAvgDamage,
        avgKills: currentAvgKills,
        winRate: currentWinRate,
        gamesPlayed: gamesCount,
        gameSummary: gameSummaryData?.data || []
      };
    });

    const results = await Promise.all(statsPromises);

    const allGames = results.flatMap(r => r.gameSummary);

    return {
      data: results,
      allGames
    };
  }
}
