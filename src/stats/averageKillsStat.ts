import { AVERAGE_KILLS_DISPLAY_NAME, AVERAGE_KILLS_STAT_NAME, getStatKeys, LINE_CHART } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class AverageKillsStat extends StatBase {
  constructor() {
    super(AVERAGE_KILLS_STAT_NAME, AVERAGE_KILLS_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(AVERAGE_KILLS_STAT_NAME, team);
      return await this.getStatData(team, statKeys);
    } catch {
      return null;
    }
  }
}
