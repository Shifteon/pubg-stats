import { KILLS_STAT_NAME, KILLS_DISPLAY_NAME, BAR_CHART, getStatKeys } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class TotalKillsStat extends StatBase {  
  constructor() {
    super(KILLS_STAT_NAME, KILLS_DISPLAY_NAME, BAR_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(KILLS_STAT_NAME, team);
      const data = await this.getStatData(team, statKeys);
      if (!data) {
        return null;
      }
      return {
        chartOptions: data.chartOptions,
        data: data.data.slice(-1),
      }
    } catch {
      return null;
    }
  }
}
