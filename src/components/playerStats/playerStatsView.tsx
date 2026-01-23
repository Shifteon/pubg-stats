"use client";

import { TEAM_DISPLAY_NAMES } from "@/constants";
import { useMemo, useState } from "react";
import { PlayerAggregatedData, PlayerTeamStats } from "@/stats/playerStat";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, Cell } from "recharts";
import { Select, SelectItem } from "@heroui/react";

interface PlayerStatsViewProps {
  data: PlayerAggregatedData;
  playerName: string;
}

const METRICS = [
  { key: "avgDamage", label: "Average Damage" },
  { key: "avgKills", label: "Average Kills" },
  { key: "winRate", label: "Win Rate" },
];

export default function PlayerStatsView({ data, playerName }: PlayerStatsViewProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>("avgDamage");

  const sortedData = useMemo(() => {
    // Sort by selected metric descending
    const sorted = [...data.data].sort((a, b) => {
      return (b[selectedMetric as keyof PlayerTeamStats] as number) - (a[selectedMetric as keyof PlayerTeamStats] as number);
    });

    return sorted.map(item => ({
      ...item,
      teamDisplayName: TEAM_DISPLAY_NAMES[item.teamName] || item.teamName
    }));
  }, [data, selectedMetric]);

  const bestTeam = sortedData.length > 0 ? sortedData[0] : null;

  const formatValue = (value: number) => {
    return value.toFixed(1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold capitalize">{playerName}&apos;s Team Performance</h2>
        <div className="w-full md:w-64">
          <Select
            label="Metric"
            placeholder="Select a metric"
            selectedKeys={[selectedMetric]}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            {METRICS.map((metric) => (
              <SelectItem key={metric.key}>
                {metric.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {bestTeam && (
        <div className="p-4 bg-content1 rounded-lg">
          <p className="text-lg">
            Best Team for <span className="font-bold">{METRICS.find(m => m.key === selectedMetric)?.label}</span>:
            <span className="text-primary font-bold ml-2">{bestTeam.teamDisplayName}</span>
            <span className="text-default-500 ml-2">({formatValue(bestTeam[selectedMetric as keyof PlayerTeamStats] as number)})</span>
          </p>
        </div>
      )}

      <div className="w-full h-[500px] bg-content1 p-4 rounded-lg shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="teamDisplayName" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--heroui-content1))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [formatValue(value), METRICS.find(m => m.key === selectedMetric)?.label]}
            />
            <Legend />
            <Bar dataKey={selectedMetric} name={METRICS.find(m => m.key === selectedMetric)?.label} fill="#8884d8">
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? "#F95738" : "#277CE0"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
