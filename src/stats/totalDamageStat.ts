import { DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART } from "@/constants";
import { StatBase } from "./statBase";

export class TotalDamageStat extends StatBase {
  constructor(team: string) {
    super(team, DAMAGE_STAT_NAME, DAMAGE_DISPLAY_NAME, BAR_CHART);
  }
}
