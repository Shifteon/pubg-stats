import { getStatKeys, KILL_STEALING_DISPLAY_NAME, KILL_STEALING_STAT_NAME, LINE_CHART } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class KillStealingStat extends StatBase {
  constructor() {
    super(KILL_STEALING_STAT_NAME, KILL_STEALING_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(KILL_STEALING_STAT_NAME, team);
      return await this.getStatData(team, statKeys);
    } catch {
      return null;
    }
  }
}
