import {
  AVERAGE_DAMAGE_STAT_NAME,
  AVERAGE_KILLS_STAT_NAME,
  TEAM_MEMBER_MAP,
  VALID_TEAM_NAMES,
  WIN_RATE_STAT_NAME
} from "@/constants";
import { AverageDamageStat } from "./averageDamageStat";
import { AverageKillsStat } from "./averageKillsStat";
import { WinRateStat } from "./winrateStat";
import { ChartOptions } from "./statBase";

export interface PlayerTeamStats {
  teamName: string;
  avgDamage: number;
  avgKills: number;
  winRate: number;
  gamesPlayed: number;
}

export interface PlayerAggregatedData {
  chartOptions: ChartOptions[];
  data: PlayerTeamStats[];
}

export class PlayerStat {
  private avgDamageStat: AverageDamageStat;
  private avgKillsStat: AverageKillsStat;
  private winRateStat: WinRateStat;

  constructor() {
    this.avgDamageStat = new AverageDamageStat();
    this.avgKillsStat = new AverageKillsStat();
    this.winRateStat = new WinRateStat();
  }

  public async getStats(playerName: string): Promise<PlayerAggregatedData> {
    const playerTeams = VALID_TEAM_NAMES.filter(team => {
      const members = TEAM_MEMBER_MAP[team];
      return members && members.includes(playerName.toLowerCase());
    });

    const statsPromises = playerTeams.map(async (team) => {
      const [damageData, killsData, winRateData] = await Promise.all([
        this.avgDamageStat.getStats(team),
        this.avgKillsStat.getStats(team),
        this.winRateStat.getStats(team)
      ]);

      // Calculate averages for the player in this team
      // The existing getStats returns arrays of data (per game usually)
      // We need to aggregate this into a single value per team for the player

      const playerDamageKey = `${playerName.toLowerCase()}_damage`;
      const playerKillsKey = `${playerName.toLowerCase()}_kills`;

      let totalDamage = 0;
      let totalKills = 0;
      let gamesCount = 0;
      let currentWinRate = 0;

      if (damageData && damageData.data.length > 0) {
        gamesCount = damageData.data.length;
        totalDamage = damageData.data.reduce((sum, game) => sum + (game[playerDamageKey] || 0), 0);
      }

      if (killsData && killsData.data.length > 0) {
        totalKills = killsData.data.reduce((sum, game) => sum + (game[playerKillsKey] || 0), 0);
      }

      if (winRateData && winRateData.data.length > 0) {
        const lastEntry = winRateData.data[winRateData.data.length - 1];
        currentWinRate = lastEntry ? (lastEntry['win_rate'] || lastEntry['winrate'] || 0) : 0;
      }

      return {
        teamName: team,
        avgDamage: gamesCount > 0 ? totalDamage / gamesCount : 0,
        avgKills: gamesCount > 0 ? totalKills / gamesCount : 0,
        winRate: currentWinRate,
        gamesPlayed: gamesCount
      };
    });

    const results = await Promise.all(statsPromises);


    return {
      chartOptions: [],
      data: results
    };
  }
}
