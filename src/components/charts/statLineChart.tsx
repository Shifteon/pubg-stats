"use client";

import { GAME_INDEX_KEY } from '@/constants';
import { FrontendStatArray, IndividualStats } from '@/types';
import { getLineName, getStrokeColor, removeEmptyKeys } from '@/utils/chartUtils';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';

interface StatLineChartProps {
  data: FrontendStatArray;
}

export default function StatLineChart(props: StatLineChartProps) {
  const data = props.data;

  const [dataKeys, setDataKeys] = useState<string[]>([]);

  useEffect(() => {
    const keys = removeEmptyKeys(data);
    setDataKeys(keys);
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
    const values = data.flatMap(game => {
      return dataKeys.map(key => game[key as keyof IndividualStats])
    });
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
      <Tooltip />
      <Legend />

      {dataKeys.map(key => (
        <React.Fragment key={key}>
          <Line type="monotone" dot={false} dataKey={key} stroke={getStrokeColor(key)} name={getLineName(key)} strokeWidth={2} />
        </React.Fragment>
      ))}
    </LineChart>
  )
}