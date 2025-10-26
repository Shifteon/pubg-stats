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
    const dataPoint = data[0];
    const keys = Object.keys(dataPoint).filter(key => key !== 'gameIndex');

    keys.forEach((key, i) => {
      if (chartOptions[i]) {
        combined.push({ ...chartOptions[i], [key]: dataPoint[key] });
      }
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
    <Tooltip />
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