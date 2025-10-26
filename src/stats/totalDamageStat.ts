import { DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART, STAT_KEY_MAP } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class TotalDamageStat extends StatBase {
  constructor() {
    super(DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    const data = await this.getStatData(team, STAT_KEY_MAP[DAMAGE_STAT_NAME]);
    if (!data) {
      return null;
    }
    return {
      chartOptions: data.chartOptions,
      data: data.data.slice(-1),
    }
  }
}
