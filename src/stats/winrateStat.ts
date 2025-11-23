import { WIN_RATE_STAT_NAME, LINE_CHART, WIN_RATE_DISPLAY_NAME, getStatKeys } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class WinRateStat extends StatBase {
  public hasMembers = false;

  constructor() {
    super(WIN_RATE_STAT_NAME, WIN_RATE_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    try {
      const statKeys = getStatKeys(WIN_RATE_STAT_NAME, team);
      return await this.getStatData(team, statKeys);
    } catch {
      return null;
    }
  }
}
