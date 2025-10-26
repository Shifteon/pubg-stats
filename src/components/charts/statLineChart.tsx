"use client";

import { GAME_INDEX_KEY } from '@/constants';
import { StatData } from '@/stats/statBase';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

interface StatLineChartProps {
  data: StatData;
}

export default function StatLineChart(props: StatLineChartProps) {
  const [data, setData] = useState<Record<string, number>[]>(props.data.data || []);
  const [chartOptions, setChartOptions] = useState(props.data.chartOptions || []);

  useEffect(() => {
    setData(props.data.data || []);
    setChartOptions(props.data.chartOptions || []);
  }, [props]);

  const getXAxisInterval = (): number => {
    if (data.length > 80) {
      return 20;
    }
    if (data.length < 20) {
      return 1;
    }
    return 5;
  };

  const getYAxisDomain = (): AxisDomain => {
    if (!data.length) {
      return ['auto', 'auto'];
    }
    const values = data.flatMap(stat => stat.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bufferPercent = 0.05; // 5%

    // Handle case where all values are the same
    if (min === max) {
      const safeMin = Math.max(0, min - 1);
      const safeMax = max + 1;
      return [safeMin, safeMax];
    }

    // Calculate the range (difference between max and min)
    const range = max - min;
    
    // Calculate the buffer amount (e.g., 5% of the range)
    const bufferAmount = range * bufferPercent;

    // New Minimum: actual minimum minus the buffer (ensures no negative minimum for counts)
    const newYMin = Math.max(0, min - bufferAmount);

    // New Maximum: actual maximum PLUS the buffer
    const newYMax = max + bufferAmount;

    return [newYMin, newYMax];
  };

  return (
    <LineChart
      style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.5 }}
      responsive
      data={data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis interval={getXAxisInterval()} domain={[20, 'auto']} dataKey={GAME_INDEX_KEY} />
      <YAxis interval="preserveEnd" allowDecimals={false} domain={getYAxisDomain()} startOffset={3} scale="linear" width="auto" type='number' />
      <Tooltip formatter={value => Number(value.valueOf()).toFixed(2)} />
      <Legend />

      {chartOptions.map(options => (
        <React.Fragment key={options.key}>
          <Line type="monotone" dot={false} dataKey={options.key} stroke={options.color} name={options.displayName} strokeWidth={2} />
        </React.Fragment>
      ))}
    </LineChart>
  )
}