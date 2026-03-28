import React from 'react';
import { Card, CardHeader, CardBody } from '@heroui/react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { subDays } from 'date-fns';
import { HeatmapDate } from '@/hooks/useDashboard';

interface ActivityHeatmapCardProps {
  heatmapDates: HeatmapDate[];
}

export function ActivityHeatmapCard({ heatmapDates }: ActivityHeatmapCardProps) {
  return (
    <Card isBlurred className="col-span-1 md:col-span-2 bg-background/60 dark:bg-default-100/50">
      <CardHeader className="font-bold text-sm pb-0">30-Day Activity</CardHeader>
      <CardBody className="overflow-hidden">
        <div className="w-full h-full flex items-center pt-2">
          <CalendarHeatmap
            startDate={subDays(new Date(), 30)}
            endDate={new Date()}
            values={heatmapDates}
            classForValue={(value?: { count?: number; date?: string | Date | number }) => {
              if (!value || typeof value.count !== 'number' || value.count === 0) {
                return 'color-empty';
              }
              // scale 1-4
              const count = value.count;
              if (count < 2) return `color-scale-1`;
              if (count < 4) return `color-scale-2`;
              if (count < 6) return `color-scale-3`;
              return `color-scale-4`;
            }}
            showWeekdayLabels
            gutterSize={2}
          />
        </div>
      </CardBody>
    </Card>
  );
}
