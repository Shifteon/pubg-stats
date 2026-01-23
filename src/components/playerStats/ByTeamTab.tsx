"use client";

import { TEAM_ABBREVIATIONS } from "@/constants";
import { useMemo } from "react";
import { PlayerAggregatedData, PlayerTeamStats } from "@/stats/playerStat";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, Cell } from "recharts";

interface ByTeamTabProps {
  data: PlayerAggregatedData;
}

const METRICS = [
  { key: "avgDamage", label: "Average Damage" },
  { key: "avgKills", label: "Average Kills" },
  { key: "winRate", label: "Win Rate" },
];

export default function ByTeamTab({ data }: ByTeamTabProps) {
  const processDataForMetric = (metricKey: string) => {
    // Sort by the specific metric descending
    const sorted = [...data.data].sort((a, b) => {
      return (b[metricKey as keyof PlayerTeamStats] as number) - (a[metricKey as keyof PlayerTeamStats] as number);
    });

    return sorted.map(item => ({
      ...item,
      teamDisplayName: TEAM_ABBREVIATIONS[item.teamName] || item.teamName
    }));
  };

  const formatValue = (value: number, key: string) => {
    if (key === 'winRate') return `${value.toFixed(1)}%`;
    return value.toFixed(1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">Performance By Team</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {METRICS.map((metric) => {
          const chartData = processDataForMetric(metric.key);

          return (
            <div key={metric.key} className="w-full h-[400px] bg-content1 p-4 rounded-lg shadow-sm flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-center">{metric.label}</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="teamDisplayName"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--heroui-content1))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatValue(value, metric.key), metric.label]}
                  />
                  <Legend />
                  <Bar dataKey={metric.key} name={metric.label}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#F95738" : "#277CE0"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
