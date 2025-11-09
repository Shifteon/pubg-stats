import { KILL_STEALING_DISPLAY_NAME, KILL_STEALING_STAT_NAME, LINE_CHART, STAT_KEY_MAP } from "@/constants";
import { StatBase, StatData } from "./statBase";

export class KillStealingStat extends StatBase {
  constructor() {
    super(KILL_STEALING_STAT_NAME, KILL_STEALING_DISPLAY_NAME, LINE_CHART);
  }

  public async getStats(team: string): Promise<StatData| null> {
    const data = await this.getStatData(team, STAT_KEY_MAP[KILL_STEALING_STAT_NAME]);
    console.log("Kill stealing data: ", data);
    return data;
    return await this.getStatData(team, STAT_KEY_MAP[KILL_STEALING_STAT_NAME]);
  }
}
