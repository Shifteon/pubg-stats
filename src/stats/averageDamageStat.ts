import { AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART, STAT_KEY_MAP } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class AverageDamageStat extends StatBase {
  constructor() {
    super(AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    return await this.getStatData(team, STAT_KEY_MAP[AVERAGE_DAMAGE_STAT_NAME]);
  }
}
