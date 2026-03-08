"use client";

import { StatName, TeamStatTimelinePoint } from "@/types";
import { useMemo } from "react";
import StatLineChart from "@/components/charts/statLineChart";
import { BAR_CHART, GAME_INDEX_KEY, LINE_CHART, PLAYER_COLOR_MAP, TEAM_LOWERCASE } from "@/constants";
import StatBarChart from "@/components/charts/statBarChart";
import { StatData } from "@/stats/statBase";

export interface GamePerformanceStatProps {
  statName: StatName;
  selectedMembers: string[];
  teamStatsTimeline: TeamStatTimelinePoint[];
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

  const statData = useMemo<StatData>(() => {
    if (!props.teamStatsTimeline || props.teamStatsTimeline.length === 0) {
      return { data: [], chartOptions: [] };
    }

    const data: Record<string, number>[] = [];

    // We need to dynamically construct the chart options for however many unique players exist for this stat
    const optionKeys = new Set<string>();

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
        Object.entries(statObject).forEach(([key, value]) => {
          // If a member exists or it's 'team', use their lowercase name to prefix
          const fullKey = `${key}_${props.statName}`;
          dataObj[fullKey] = value;
          optionKeys.add(fullKey);
        });
      }
      data.push(dataObj);
    });

    const chartOptions = Array.from(optionKeys).map(fullKey => {
      const player = fullKey.split('_')[0];

      let color = PLAYER_COLOR_MAP[player] || "#cccccc";
      let name = player.charAt(0).toUpperCase() + player.slice(1);

      if (fullKey === "win_rate") {
        color = "#F95738";
        name = "Win Rate";
      } else if (player === TEAM_LOWERCASE) {
        name = "Team";
      }

      return {
        key: fullKey,
        name: name,
        displayName: name,
        color: color
      };
    });

    return { data, chartOptions };
  }, [props.teamStatsTimeline, props.statName]);

  const filteredStatData = useMemo<StatData>(() => {
    if (!statData || statData.data.length === 0 || !hasMembers) {
      return statData;
    }

    // Include selected members and "team"
    const allowedPrefixes = [...props.selectedMembers, TEAM_LOWERCASE];

    const filteredOptions = statData.chartOptions.filter(option => {
      const prefix = option.key.split('_')[0];
      // special case
      if (option.key === 'win_rate' || STATS_WITHOUT_MEMBERS.includes(props.statName)) return true;
      return allowedPrefixes.includes(prefix);
    });

    const filteredData = statData.data.map(d => {
      const row: Record<string, number> = {};
      Object.keys(d).forEach(k => {
        if (k === GAME_INDEX_KEY) {
          row[k] = d[k];
        } else {
          const prefix = k.split('_')[0];
          if (k === 'win_rate' || STATS_WITHOUT_MEMBERS.includes(props.statName) || allowedPrefixes.includes(prefix)) {
            row[k] = d[k];
          }
        }
      });
      return row;
    });

    return {
      data: filteredData,
      chartOptions: filteredOptions,
    };
  }, [statData, props.selectedMembers, hasMembers, props.statName]);

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