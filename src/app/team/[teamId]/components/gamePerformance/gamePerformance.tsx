"use client";

import { StatName, TeamStatTimelinePoint, PlayerMetadata } from "@/types";
import { useMemo } from "react";
import StatLineChart from "@/components/charts/statLineChart";
import { BAR_CHART, GAME_INDEX_KEY, LINE_CHART, PERCENTAGE_OF_DATA_TO_REMOVE } from "@/constants";
import StatBarChart from "@/components/charts/statBarChart";
import { StatData } from "@/stats/statBase";

export interface GamePerformanceStatProps {
  statName: StatName;
  selectedMembers: string[];
  teamStatsTimeline: TeamStatTimelinePoint[];
  players: PlayerMetadata[];
}

// Map the statName prop to its user-friendly display name
const STAT_DISPLAY_NAMES: Record<string, string> = {
  avgKills: "Average Kills",
  avgDamage: "Average Damage",
  winRate: "Win Rate",
  killStealing: "Kill Stealing",
  kills: "Total Kills",
  damage: "Total Damage",
};

// Based on the legacy stat classes, map out the default chart type for each stat
const STAT_CHART_TYPES: Record<string, string> = {
  avgKills: LINE_CHART,
  avgDamage: LINE_CHART,
  winRate: LINE_CHART,
  killStealing: LINE_CHART,
  kills: BAR_CHART,
  damage: BAR_CHART,
};

// Based on legacy logic, Kill Stealing & Win Rate don't support individual member filtering because they calculate off the team natively or compare internally
const STATS_WITHOUT_MEMBERS = ["killStealing", "winRate"];

export default function GamePerformanceStat(props: GamePerformanceStatProps) {
  const statDisplayName = STAT_DISPLAY_NAMES[props.statName] || props.statName;
  const chartType = STAT_CHART_TYPES[props.statName] || LINE_CHART;
  const hasMembers = !STATS_WITHOUT_MEMBERS.includes(props.statName);

  const filteredStatData = useMemo<StatData>(() => {
    if (!props.teamStatsTimeline || props.teamStatsTimeline.length === 0) {
      return { data: [], chartOptions: [] };
    }

    const optionKeys = new Set<string>();
    let data: Record<string, number>[] = [];

    const allowedIds = [...props.selectedMembers, "win_rate"];
    if (props.statName !== "kills" && props.statName !== "damage") {
      allowedIds.push("team");
    }

    props.teamStatsTimeline.forEach(point => {
      const dataObj: Record<string, number> = { [GAME_INDEX_KEY]: point.gameIndex };

      let statObject: Record<string, number> | number = {};

      switch (props.statName) {
        case "avgKills": statObject = point.avgKills || {}; break;
        case "avgDamage": statObject = point.avgDamage || {}; break;
        case "kills": statObject = point.kills || {}; break;
        case "damage": statObject = point.damage || {}; break;
        case "killStealing": statObject = point.killStealing || {}; break;
        case "winRate": statObject = point.winRate || 0; break;
        default: break;
      }

      if (typeof statObject === 'number') {
        dataObj["win_rate"] = statObject; // Legacy format used "win_rate" for WinRate Chart
        optionKeys.add("win_rate");
      } else if (statObject) {
        Object.entries(statObject).forEach(([playerId, value]) => {
          if (hasMembers && !allowedIds.includes(playerId)) return;

          const fullKey = `${playerId}_${props.statName}`;
          dataObj[fullKey] = value;
          optionKeys.add(fullKey);
        });
      }
      data.push(dataObj);
    });

    const chartOptions = Array.from(optionKeys).map(fullKey => {
      const playerKey = fullKey.split('_')[0]; // either an ID, "team", or "win" if "win_rate"

      let color = "#cccccc";
      let name = "Unknown";

      if (fullKey === "win_rate") {
        color = "#F95738";
        name = "Win Rate";
      } else if (playerKey === "team") {
        color = "#6C3BAA";
        name = "Team";
      } else {
        const playerMeta = props.players.find(p => p.id === playerKey);
        if (playerMeta) {
          color = playerMeta.color;
          name = playerMeta.name.charAt(0).toUpperCase() + playerMeta.name.slice(1);
        } else {
          name = playerKey.charAt(0).toUpperCase() + playerKey.slice(1);
        }
      }

      return {
        key: fullKey,
        name: name,
        displayName: name,
        color: color
      };
    });
    if (chartType === LINE_CHART) {
      // remove some of the data to nomralize it
      const startIndex = Math.ceil(data.length * PERCENTAGE_OF_DATA_TO_REMOVE);
      data = data.slice(startIndex);
    }

    return { data, chartOptions };
  }, [props.teamStatsTimeline, props.statName, props.selectedMembers, hasMembers, props.players]);

  const getChart = () => {
    if (filteredStatData.data.length === 0) {
      return <div>No Data Available</div>;
    }

    switch (chartType) {
      case LINE_CHART:
        return <StatLineChart data={filteredStatData} />;
      case BAR_CHART:
        return <StatBarChart data={filteredStatData} />;
      default:
        return <div>View Not Found</div>;
    }
  };

  return (
    <div className="relative mt-2">
      <div className="w-full flex flex-col items-center">
        <h2 className="p-2 self-start">{statDisplayName}</h2>
        {getChart()}
      </div>
    </div>
  );
}