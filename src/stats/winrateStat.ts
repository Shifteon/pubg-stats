import { WIN_RATE_STAT_NAME, LINE_CHART, STAT_KEY_MAP, WIN_RATE_DISPLAY_NAME } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class WinRateStat extends StatBase {
  public hasMembers = false;

  constructor() {
    super(WIN_RATE_STAT_NAME, WIN_RATE_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    return await this.getStatData(team, STAT_KEY_MAP[WIN_RATE_STAT_NAME]);
  }
}
