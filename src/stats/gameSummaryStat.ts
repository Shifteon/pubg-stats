import { BAR_CHART, GAME_SUMMARY_DISPLAY_NAME, GAME_SUMMARY_STAT_NAME, STAT_KEY_MAP } from "@/constants";
import { StatBase, StatData } from "./statBase";
import { TeamName } from "@/types";

export class GameSummaryStat extends StatBase {
  constructor() {
    // The chart type is not used here, but required by the base class.
    super(GAME_SUMMARY_STAT_NAME, GAME_SUMMARY_DISPLAY_NAME, BAR_CHART);
  }

  async getStats(team: TeamName): Promise<StatData | null> {
    const data = await this.getStatData(team, STAT_KEY_MAP[GAME_SUMMARY_STAT_NAME]);

    if (!data?.data || data.data.length === 0) {
      return null;
    }

    return { data: data.data, chartOptions: data?.chartOptions };
  }
}