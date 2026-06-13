"use client";

import React, { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  TooltipContentProps
} from "recharts";
import { GAME_INDEX_KEY } from "@/constants";
import { StatData } from "@/types";

export type RechartsValueType = number | string | readonly (number | string)[];
export type RechartsNameType = number | string;
export type ScatterTooltipProps = TooltipContentProps<RechartsValueType, RechartsNameType>;

export interface ScatterPointData {
  x: number;
  y: number;
  gameIndex?: number;
  optionKey: string;
}

export interface StatScatterChartProps {
  data: StatData;
  xAxisKey?: string | ((optionKey: string) => string);
  yAxisKey?: string | ((optionKey: string) => string);
  xDisplayName?: string;
  yDisplayName?: string;
  referenceValue?: number;
  xAllowDecimals?: boolean;
  yAllowDecimals?: boolean;
  maximumFractionDigits?: number;
  aspectRatio?: number;
}

export default function StatScatterChart({
  data: statDataProps,
  xAxisKey,
  yAxisKey,
  xDisplayName = "Game Index",
  yDisplayName = "Value",
  referenceValue,
  xAllowDecimals = false,
  yAllowDecimals = false,
  maximumFractionDigits = 2,
  aspectRatio = 1.5,
}: StatScatterChartProps) {
  const { data = [], chartOptions = [] } = statDataProps;

  // Resolve X and Y keys for each option
  const xAxisKeyFn = useMemo(() => {
    if (typeof xAxisKey === "function") return xAxisKey;
    return () => (xAxisKey ?? GAME_INDEX_KEY);
  }, [xAxisKey]);

  const yAxisKeyFn = useMemo(() => {
    if (typeof yAxisKey === "function") return yAxisKey;
    return (optionKey: string) => (yAxisKey ?? optionKey);
  }, [yAxisKey]);

  // Construct series data for each chart option
  const scatterSeries = useMemo(() => {
    if (!data.length || !chartOptions.length) return [];

    return chartOptions.map((option) => {
      const xKey = xAxisKeyFn(option.key);
      const yKey = yAxisKeyFn(option.key);

      const points = data
        .filter((d) => d[xKey] !== undefined && d[yKey] !== undefined)
        .map((d) => ({
          x: Number(d[xKey]),
          y: Number(d[yKey]),
          gameIndex: d[GAME_INDEX_KEY] !== undefined ? Number(d[GAME_INDEX_KEY]) : undefined,
          optionKey: option.key,
        }));

      return {
        option,
        points,
      };
    });
  }, [data, chartOptions, xAxisKeyFn, yAxisKeyFn]);

  // Calculate dynamic domains with a 5% buffer
  const xAxisDomain = useMemo(() => {
    const allXValues = scatterSeries.flatMap((series) => series.points.map((p) => p.x));
    if (!allXValues.length) return ["auto", "auto"];
    const min = Math.min(...allXValues);
    const max = Math.max(...allXValues);
    if (min === max) {
      return [Math.max(0, min - 1), max + 1];
    }
    const range = max - min;
    const buffer = range * 0.05;
    const resolvedMin = min < 0 ? min - buffer : Math.max(0, min - buffer);
    return [resolvedMin, max + buffer];
  }, [scatterSeries]);

  const yAxisDomain = useMemo(() => {
    const allYValues = scatterSeries.flatMap((series) => series.points.map((p) => p.y));
    const valuesWithRef = referenceValue !== undefined ? [...allYValues, referenceValue] : allYValues;
    if (!valuesWithRef.length) return ["auto", "auto"];
    const min = Math.min(...valuesWithRef);
    const max = Math.max(...valuesWithRef);
    if (min === max) {
      return [Math.max(0, min - 1), max + 1];
    }
    const range = max - min;
    const buffer = range * 0.05;
    const resolvedMin = min < 0 ? min - buffer : Math.max(0, min - buffer);
    return [resolvedMin, max + buffer];
  }, [scatterSeries, referenceValue]);

  const CustomTooltip = ({ active, payload }: Partial<ScatterTooltipProps>) => {
    if (active && payload && payload.length) {
      const pointData = payload[0].payload as ScatterPointData;
      const option = chartOptions.find((o) => o.key === pointData.optionKey);
      return (
        <div className="p-3 rounded-lg border shadow-md bg-content1 border-divider text-foreground text-xs flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
          <p className="font-bold" style={{ color: option?.color }}>
            {option?.displayName || "Player"}
          </p>
          {pointData.gameIndex !== undefined && (
            <p className="text-default-400 text-[10px]">Game: {pointData.gameIndex}</p>
          )}
          <div className="flex flex-col gap-0.5 mt-1 border-t border-divider pt-1">
            <p>
              <span className="font-medium text-default-500">{xDisplayName}:</span>{" "}
              {new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(pointData.x)}
            </p>
            <p>
              <span className="font-medium text-default-500">{yDisplayName}:</span>{" "}
              {new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(pointData.y)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!scatterSeries.length || scatterSeries.every((s) => s.points.length === 0)) {
    return (
      <div className="w-full flex items-center justify-center p-8 text-default-400 text-sm">
        No Data Available
      </div>
    );
  }

  return (
    <ScatterChart
      style={{ width: "100%", height: "100%", maxHeight: "70vh", aspectRatio }}
      responsive
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="x"
        name={xDisplayName}
        domain={xAxisDomain}
        allowDecimals={xAllowDecimals}
        tickFormatter={(val) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(val)}
      />
      <YAxis
        type="number"
        dataKey="y"
        name={yDisplayName}
        domain={yAxisDomain}
        allowDecimals={yAllowDecimals}
        width="auto"
        tickFormatter={(val) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(val)}
      />
      <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomTooltip />} />
      <Legend />
      
      {referenceValue !== undefined && (
        <ReferenceLine
          y={referenceValue}
          stroke="hsl(var(--heroui-default-400))"
          strokeWidth={1}
        />
      )}

      {scatterSeries.map(({ option, points }) => (
        <Scatter
          key={option.key}
          name={option.displayName}
          data={points}
          fill={option.color}
        />
      ))}
    </ScatterChart>
  );
}
