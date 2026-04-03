"use client";

import React, { useMemo } from "react";

export interface ComparisonItem {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
}

export interface ButterflyBarChartProps {
  data: ComparisonItem[];
}

export default function ButterflyBarChart({ data }: ButterflyBarChartProps) {
  
  const legendItems = useMemo(() => {
    if (!data) return [];
    const itemsMap = new Map<string, string>();
    data.forEach(item => {
      const lColor = item.leftColor || "hsl(var(--heroui-primary))";
      if (!itemsMap.has(item.leftLabel)) {
         itemsMap.set(item.leftLabel, lColor);
      }
      const rColor = item.rightColor || "hsl(var(--heroui-warning))";
      if (!itemsMap.has(item.rightLabel)) {
         itemsMap.set(item.rightLabel, rColor);
      }
    });
    return Array.from(itemsMap.entries()).map(([label, color]) => ({ label, color }));
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 w-full mt-2">
      {/* Header/Legend */}
      <div className="flex flex-wrap justify-center items-center text-xs text-default-500 mb-2 gap-4 px-4">
         {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
         ))}
      </div>

      {/* Rows */}
      {data.map((item, index) => {
        const leftVal = item.leftValue || 0;
        const rightVal = item.rightValue || 0;
        const total = leftVal + rightVal;
        
        // Calculate percentages
        const leftPct = total > 0 ? (leftVal / total) * 100 : 50;
        const rightPct = total > 0 ? (rightVal / total) * 100 : 50;

        const leftColorValue = item.leftColor || "hsl(var(--heroui-primary))";
        const rightColorValue = item.rightColor || "hsl(var(--heroui-warning))";

        return (
          <div key={`chart-row-${index}`} className="flex flex-col gap-1 w-full relative pt-2">
             <div className="flex justify-between items-end text-[10px] text-default-400 font-medium px-1 w-full">
                <span>{item.leftLabel}</span>
                <span>{item.rightLabel}</span>
             </div>
             
             <div className="flex items-center justify-between w-full h-6 relative mt-1">
                {/* Left value indicator */}
                <span className="text-sm font-bold w-14 text-right pr-2 shrink-0">{Number(leftVal).toFixed(1)}</span>
                
                {/* 100% Bar Container */}
                <div className="grow h-3 bg-default-100 flex overflow-hidden rounded-full shadow-inner z-0">
                  <div 
                     className="h-full transition-all duration-700 ease-in-out" 
                     style={{ width: `${leftPct}%`, backgroundColor: leftColorValue }}
                  />
                  {/* Divider line in middle */}
                  <div className="w-0.5 h-full bg-background shrink-0" />
                  <div 
                     className="h-full transition-all duration-700 ease-in-out" 
                     style={{ width: `${rightPct}%`, backgroundColor: rightColorValue }}
                  />
                </div>
                
                {/* Right value indicator */}
                <span className="text-sm font-bold w-14 text-left pl-2 shrink-0">{Number(rightVal).toFixed(1)}</span>
             </div>
          </div>
        );
      })}
    </div>
  );
}
