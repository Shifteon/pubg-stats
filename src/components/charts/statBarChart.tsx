"use client";

import { StatData } from "@/stats/statBase";
import React from "react";
import { useEffect, useState } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LegendProps } from "recharts";

export interface StatBarChartProps {
  data: StatData;
}

export default function StatBarChart(props: StatBarChartProps) {
  const [data, setData] = useState<Record<string, number>[]>(props.data.data || []);
  const [chartOptions, setChartOptions] = useState(props.data.chartOptions || []);

  useEffect(() => {
    setData(props.data.data || []);
    setChartOptions(props.data.chartOptions || []);
  }, [props]);
  
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '1000px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis />
      <YAxis width="auto" />
    {/* <Tooltip /> */}
    <Legend />

    {chartOptions.map(option => (
      <React.Fragment key={option.key}>
        <Bar type="monotone" dataKey={option.key} fill={option.color} name={option.displayName} strokeWidth={2} />
      </React.Fragment>
    ))}
  </BarChart>
  );
}