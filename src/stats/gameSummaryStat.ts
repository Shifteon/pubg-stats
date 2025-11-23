import { BAR_CHART, GAME_SUMMARY_DISPLAY_NAME, GAME_SUMMARY_STAT_NAME, getStatKeys } from "@/constants";
import { StatBase, StatData } from "./statBase";
import { TeamName } from "@/types";

export class GameSummaryStat extends StatBase {
  constructor() {
    // The chart type is not used here, but required by the base class.
    super(GAME_SUMMARY_STAT_NAME, GAME_SUMMARY_DISPLAY_NAME, BAR_CHART);
  }

  async getStats(team: TeamName): Promise<StatData | null> {
    try {
      const statKeys = getStatKeys(GAME_SUMMARY_STAT_NAME, team);
      const data = await this.getStatData(team, statKeys, false);

      if (!data?.data || data.data.length === 0) {
        return null;
      }
      console.log(data.data);

      return { data: data.data, chartOptions: data?.chartOptions };
    } catch {
      return null;
    }
  }
}