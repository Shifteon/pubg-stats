"use client";

import { TEAM_LOWERCASE } from "@/constants";
import { FrontendStatArray, StatName } from "@/types";
import { getLineName, getStrokeColor, removeEmptyKeys } from "@/utils/chartUtils";
import React from "react";
import { useEffect, useState } from "react";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LegendProps } from "recharts";
import { ContentType } from "recharts/types/component/DefaultLegendContent";
import { Props } from "recharts/types/component/Legend";

export interface StatBarChartProps {
  data: FrontendStatArray;
  statName: StatName;
}

export default function StatBarChart(props: StatBarChartProps) {
  const data = props.data?.slice(-1) || []; // We only want the last part
  const [dataKeys, setDataKeys] = useState<string[]>([]);

  useEffect(() => {
    if (data.length) {
      // we don't want null numbers or the team stats since that messes up the chart
      const keys = removeEmptyKeys(data, props.statName).filter(key => key !== TEAM_LOWERCASE);
      setDataKeys(keys);
    }
  }, [props]);
  
  return (
    <BarChart
      style={{ width: '100%', maxWidth: '1000px', maxHeight: '70vh', aspectRatio: 1.618 }}
      responsive data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis />
      <YAxis width="auto" />
    {/* <Tooltip /> */}
    <Tooltip />
    <Legend />

    {dataKeys.map(key => (
      <React.Fragment key={key}>
        <Bar type="monotone" dataKey={key} fill={getStrokeColor(key)} name={getLineName(key)} strokeWidth={2} />
      </React.Fragment>
    ))}
  </BarChart>
  );
}