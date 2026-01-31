import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps
} from "recharts";


export interface RadarSeries {
  key: string;
  color: string;
  name: string;
  opacity?: number;
}

export interface RadarDataPoint {
  subject: string;
  fullMark: number;
  [key: string]: number | string; // Allow dynamic player keys
}

interface StatRadarChartProps {
  data: RadarDataPoint[];
  series: RadarSeries[];
  tooltipContent?: (props: TooltipContentProps<string | number, string>) => React.JSX.Element | null;
  domain?: [number, number];
}

export default function StatRadarChart({ data, series, tooltipContent, domain = [0, 100] }: StatRadarChartProps) {
  return (
    <div className="w-full h-[300px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--heroui-default-200))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "hsl(var(--heroui-foreground))", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={domain}
            tick={false}
            axisLine={false}
          />
          {series.map((s) => (
            <Radar
              key={s.key}
              name={s.name}
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={3}
              fill={s.color}
              fillOpacity={s.opacity || 0.3}
            />
          ))}
          <Tooltip content={tooltipContent} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}