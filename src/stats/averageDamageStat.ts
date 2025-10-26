import { AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART } from "@/constants";
import { StatBase } from "./statBase";

export class AverageDamageStat extends StatBase {
  constructor(team: string) {
    super(team, AVERAGE_DAMAGE_STAT_NAME, AVERAGE_DAMAGE_DISPLAY_NAME, LINE_CHART);
  }
}
