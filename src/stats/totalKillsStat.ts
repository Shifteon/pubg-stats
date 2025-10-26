import { KILLS_STAT_NAME, KILLS_DISPLAY_NAME, BAR_CHART } from "@/constants";
import { StatBase } from "./statBase";

export class TotalKillsStat extends StatBase {  
  constructor(team: string) {
    super(team, KILLS_STAT_NAME, KILLS_DISPLAY_NAME, BAR_CHART);
  }
}
