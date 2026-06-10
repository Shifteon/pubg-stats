"use client";

import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, TooltipContentProps, ResponsiveContainer } from 'recharts';
import { PlayerMetadata, TeamStatTimelinePoint } from '@/types';
import { PERCENTAGE_OF_DATA_TO_REMOVE } from '@/constants';

interface StatScatterChartProps {
  teamStatsTimeline: TeamStatTimelinePoint[];
  selectedMembers: string[];
  players: PlayerMetadata[];
}

interface ScatterDataPoint {
  x: number;
  y: number;
  gameIndex: number;
  ratio: number;
}

const CustomTooltip = ({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload as ScatterDataPoint;
    const seriesName = payload[0].name;
    const color = payload[0].color;
    return (
      <div 
        className="p-3 border rounded-lg shadow-md text-sm"
        style={{
          backgroundColor: 'hsl(var(--heroui-content1))',
          borderColor: 'hsl(var(--heroui-content1-300))'
        }}
      >
        <p className="font-semibold mb-1" style={{ color: color }}>{seriesName}</p>
        <p>Game Index: <span className="font-medium">{dataPoint.gameIndex}</span></p>
        <p>Avg Kills: <span className="font-medium">{dataPoint.x.toFixed(2)}</span></p>
        <p>Avg Damage: <span className="font-medium">{dataPoint.y.toFixed(2)}</span></p>
        <p>Damage/Kill Ratio: <span className="font-medium text-primary">{dataPoint.ratio.toFixed(2)}</span></p>
      </div>
    );
  }
  return null;
};

export default function StatScatterChart({ teamStatsTimeline, selectedMembers, players }: StatScatterChartProps) {
  // 1. Filter and normalize timeline data (remove initial 10% to prevent extreme startup skew)
  const normalizedTimeline = useMemo(() => {
    if (!teamStatsTimeline || teamStatsTimeline.length === 0) return [];
    const startIndex = Math.ceil(teamStatsTimeline.length * PERCENTAGE_OF_DATA_TO_REMOVE);
    return teamStatsTimeline.slice(startIndex);
  }, [teamStatsTimeline]);

  // 2. Prepare series for each selected member and the team
  const seriesData = useMemo(() => {
    const seriesList: {
      id: string;
      name: string;
      color: string;
      data: ScatterDataPoint[];
    }[] = [];

    const idsToPlot = [...selectedMembers, "team"];

    idsToPlot.forEach(id => {
      let name = "Unknown";
      let color = "#6C3BAA"; // default team color

      if (id === "team") {
        name = "Team";
        color = "#6C3BAA";
      } else {
        const playerMeta = players.find(p => p.id === id);
        if (playerMeta) {
          name = playerMeta.name.charAt(0).toUpperCase() + playerMeta.name.slice(1);
          color = playerMeta.color;
        } else {
          name = id.charAt(0).toUpperCase() + id.slice(1);
        }
      }

      const points = normalizedTimeline
        .map(point => {
          const x = point.avgKills[id];
          const y = point.avgDamage[id];
          if (x === undefined || y === undefined) return null;
          return {
            x: Number(x),
            y: Number(y),
            gameIndex: point.gameIndex,
            ratio: x > 0 ? y / x : 0
          };
        })
        .filter((p): p is ScatterDataPoint => p !== null);

      if (points.length > 0) {
        seriesList.push({
          id,
          name,
          color,
          data: points
        });
      }
    });

    return seriesList;
  }, [normalizedTimeline, selectedMembers, players]);

  // Calculate dynamic axis domains with buffers
  const xAxisDomain = useMemo(() => {
    const allX = seriesData.flatMap(s => s.data.map(d => d.x));
    if (allX.length === 0) return [0, 5];
    const min = Math.max(0, Math.min(...allX) - 0.2);
    const max = Math.max(...allX) + 0.2;
    return [min, max];
  }, [seriesData]);

  const yAxisDomain = useMemo(() => {
    const allY = seriesData.flatMap(s => s.data.map(d => d.y));
    if (allY.length === 0) return [0, 500];
    const min = Math.max(0, Math.min(...allY) - 20);
    const max = Math.max(...allY) + 20;
    return [min, max];
  }, [seriesData]);

  if (seriesData.length === 0) {
    return <div className="p-4 text-gray-500">No Data Available</div>;
  }

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 30, left: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--heroui-default-200))" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Average Kills" 
            domain={xAxisDomain}
            label={{ value: 'Average Kills', position: 'bottom', offset: 10, fill: 'hsl(var(--heroui-foreground-500))' }} 
            tick={{ fill: 'hsl(var(--heroui-foreground))' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Average Damage" 
            domain={yAxisDomain}
            label={{ value: 'Average Damage', angle: -90, position: 'left', offset: 10, fill: 'hsl(var(--heroui-foreground-500))' }} 
            tick={{ fill: 'hsl(var(--heroui-foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '15px' }} />
          {seriesData.map(series => (
            <Scatter
              key={series.id}
              name={series.name}
              data={series.data}
              fill={series.color}
              line={{ stroke: series.color, strokeWidth: 2 }}
              lineType="joint"
              lineJointType="monotone"
              shape="circle"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
