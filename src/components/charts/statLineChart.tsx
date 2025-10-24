"use client";

import { FrontendStatArray } from '@/types';
import { getStrokeColor, removeEmptyKeys } from '@/utils/chartUtils';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StatLineChartProps {
  data: FrontendStatArray;
}

export default function StatLineChart(props: StatLineChartProps) {
  const [dataKeys, setDataKeys] = useState<string[]>([]);

  useEffect(() => {
    const keys = removeEmptyKeys(props.data);
    setDataKeys(keys);
  }, [props]);

  return (
    <LineChart
      style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive
      data={props.data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis interval={20} />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />

      {dataKeys.map(key => (
        <React.Fragment key={key}>
          <Line type="monotone" dot={false} dataKey={key} stroke={getStrokeColor(key)} strokeWidth={2} />
        </React.Fragment>
      ))}
    </LineChart>
  )
}