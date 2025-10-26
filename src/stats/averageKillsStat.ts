import { AVERAGE_KILLS_DISPLAY_NAME, AVERAGE_KILLS_STAT_NAME, LINE_CHART } from "@/constants";
import { StatBase } from "./statBase";

export class AverageKillsStat extends StatBase {
  constructor(team: string) {
    super(team, AVERAGE_KILLS_STAT_NAME, AVERAGE_KILLS_DISPLAY_NAME, LINE_CHART);
  }
}
