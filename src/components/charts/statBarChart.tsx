"use client";

import { StatData } from "@/stats/statBase";
import React, { useMemo } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export interface StatBarChartProps {
  data: StatData;
}

export default function StatBarChart(props: StatBarChartProps) {
  const { data = [], chartOptions = [] } = props.data;

  const combinedData = useMemo(() => {
    if (!data.length || !chartOptions.length) return;
    const combined: Record<string, number | string>[] = [];
    const dataPoint = data[data.length - 1];
    chartOptions.forEach((option) => {
      if (dataPoint[option.key] !== undefined) {
        combined.push({ ...option, [option.key]: dataPoint[option.key] });
      }
    });

    combined.sort((a, b) => {
      const optionA = chartOptions.find(o => o.key === a.key);
      const optionB = chartOptions.find(o => o.key === b.key);
      if (!optionA || !optionB) return 0;

      const valA = Number(a[optionA.key] || 0);
      const valB = Number(b[optionB.key] || 0);
      return valB - valA;
    });

    return combined;
  }, [data, chartOptions]);

  return (
    <BarChart
      style={{ width: '100%', maxWidth: '1000px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={combinedData}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="displayName" />
      <YAxis width="auto" />
      <Tooltip
        formatter={(value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(Number(value.valueOf()))}
        contentStyle={{
          backgroundColor: 'hsl(var(--heroui-content1))',
        }}
      />
      <Legend />

      {chartOptions.map(option => (
        <React.Fragment key={option.key}>
          <Bar
            type="monotone"
            xAxisId={option.displayName}
            dataKey={option.key}
            fill={option.color}
            name={option.displayName}
          />
        </React.Fragment>
      ))}
    </BarChart>
  );
}
