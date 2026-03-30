import React from 'react';
import { Card, CardHeader, CardBody, Tooltip } from '@heroui/react';
import { format, eachDayOfInterval } from 'date-fns';
import { Game } from '@/types';

interface ActivityHeatmapCardProps {
  periodGames: Game[];
  start: string;
  end: string;
}

export function ActivityHeatmapCard({ periodGames, start, end }: ActivityHeatmapCardProps) {
  const days = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
  
  const gamesPerDay = days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const count = periodGames.filter(g => {
        if (!g.playedAt) return false;
        return format(new Date(g.playedAt), 'yyyy-MM-dd') === dateStr;
    }).length;
    
    return {
      date: day,
      dateStr,
      count
    };
  });

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-default-200 dark:bg-default-100/50'; 
    if (count < 2) return 'bg-[#c6e48b] dark:bg-[#0e4429]'; 
    if (count < 4) return 'bg-[#7bc96f] dark:bg-[#006d32]';
    if (count < 6) return 'bg-[#239a3b] dark:bg-[#26a641]';
    return 'bg-[#196127] dark:bg-[#39d353]';
  };

  const isMonth = gamesPerDay.length > 7;

  return (
    <Card isBlurred className="w-full h-full bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0">Activity</CardHeader>
      <CardBody className="overflow-hidden">
        <div className="w-full h-full flex items-center justify-center pt-2">
          {isMonth ? (() => {
            const firstDay = gamesPerDay[0]?.date.getDay() || 0; // 0 is Sunday
            return (
              <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mx-auto">
                {/* Day headers */}
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={`header-${i}`} className="text-center text-[10px] text-default-400 font-semibold mb-1">
                    {d}
                  </div>
                ))}
                {/* Padding */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`pad-${i}`} className="w-4 h-4 sm:w-5 sm:h-5" />
                ))}
                {/* Days */}
                {gamesPerDay.map((dayData, i) => (
                  <Tooltip key={i} content={`${dayData.count} games on ${format(dayData.date, 'MMM d, yyyy')}`}>
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${getColorClass(dayData.count)} hover:ring-2 hover:ring-primary hover:opacity-80 transition-all cursor-pointer`} />
                  </Tooltip>
                ))}
              </div>
            )
          })() : (
            <div className="flex justify-between w-full max-w-[350px] mx-auto">
              {gamesPerDay.map((dayData, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-default-500 font-medium">
                    {format(dayData.date, 'EEIES').slice(0, 1)}
                  </span>
                  <Tooltip content={`${dayData.count} games on ${format(dayData.date, 'MMM d, yyyy')}`}>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-sm ${getColorClass(dayData.count)} hover:ring-2 hover:ring-primary hover:opacity-80 transition-all cursor-pointer`} />
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
