import { AVERAGE_KILLS_DISPLAY_NAME, AVERAGE_KILLS_STAT_NAME, LINE_CHART, STAT_KEY_MAP } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class AverageKillsStat extends StatBase {
  constructor() {
    super(AVERAGE_KILLS_STAT_NAME, AVERAGE_KILLS_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    return await this.getStatData(team, STAT_KEY_MAP[AVERAGE_KILLS_STAT_NAME]);
  }
}
