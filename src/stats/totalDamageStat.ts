import { DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART, getStatKeys } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class TotalDamageStat extends StatBase {
  constructor() {
    super(DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(DAMAGE_STAT_NAME, team);
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
