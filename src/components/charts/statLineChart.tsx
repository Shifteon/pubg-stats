"use client";

import { GAME_INDEX_KEY } from '@/constants';
import { FrontendStatArray } from '@/types';
import { getLineName, getStrokeColor, removeEmptyKeys } from '@/utils/chartUtils';
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
      style={{ width: '100%', height: '100%', maxHeight: '70vh', aspectRatio: 1.5 }}
      responsive
      data={props.data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis interval={20} domain={[20, 'auto']} dataKey={GAME_INDEX_KEY} />
      <YAxis interval="preserveEnd" allowDecimals={false} domain={[3, 'auto']} startOffset={3} scale="linear" width="auto" type='number' />
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