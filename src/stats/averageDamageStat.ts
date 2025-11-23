import { AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART, getStatKeys } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class AverageDamageStat extends StatBase {
  constructor() {
    super(AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(AVERAGE_DAMAGE_STAT_NAME, team);
      return await this.getStatData(team, statKeys);
    } catch {
      return null;
    }
  }
}
