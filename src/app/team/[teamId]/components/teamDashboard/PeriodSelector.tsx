"use client";

import React, { useMemo, useState } from 'react';
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  Button, 
  Calendar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from '@heroui/react';
import { useTeamDashboard } from '@/contexts/TeamDashboardContext';
import { parseISO, format, startOfWeek, endOfWeek, startOfMonth } from 'date-fns';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { parseDate, DateValue } from '@internationalized/date';

export function PeriodSelector() {
  const { viewType, periodRangeStr, sessions, selectedDate } = useTeamDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Parse sessions into distinct months and weeks
  const availablePeriods = useMemo(() => {
    if (viewType === 'session') return [];
    
    const periods = new Map<string, { label: string, date: string }>();
    
    sessions.forEach(sessionDate => {
      const date = parseISO(sessionDate);
      if (viewType === 'monthly') {
        const monthStart = startOfMonth(date);
        const key = format(monthStart, 'yyyy-MM');
        if (!periods.has(key)) {
          periods.set(key, {
            label: format(monthStart, 'MMMM yyyy'),
            date: format(monthStart, 'yyyy-MM-dd')
          });
        }
      } else if (viewType === 'weekly') {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
        const key = format(weekStart, 'yyyy-MM-dd');
        if (!periods.has(key)) {
          periods.set(key, {
            label: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`,
            date: key
          });
        }
      }
    });
    
    // Return array sorted descending
    return Array.from(periods.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, viewType]);

  const handleSelectDate = (dateStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateStr);
    router.push(`${pathname}?${params.toString()}`);
    setIsPopoverOpen(false);
  };

  if (viewType === 'all-time') {
    return <div className="font-medium min-w-[150px] text-center">{periodRangeStr}</div>;
  }

  if (viewType === 'session') {
    // Determine the calendar's current value
    const calendarValue = selectedDate ? parseDate(selectedDate) : 
                          sessions.length > 0 ? parseDate(sessions[0]) : 
                          undefined;
                          
    // Create a Set of session date strings for fast lookup
    const sessionDates = new Set(sessions);

    const isDateUnavailable = (date: DateValue) => {
      const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      return !sessionDates.has(dateStr);
    };

    return (
      <Popover 
        placement="bottom" 
        isOpen={isPopoverOpen} 
        onOpenChange={(open) => setIsPopoverOpen(open)}
      >
        <PopoverTrigger>
          <Button variant="flat" className="font-medium min-w-[150px]">
            {periodRangeStr}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0">
          <Calendar
            aria-label="Select a session"
            value={calendarValue}
            onChange={(date) => {
              const dateStr = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
              handleSelectDate(dateStr);
            }}
            isDateUnavailable={isDateUnavailable}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Monthly or Weekly views - Dropdown
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="flat" className="font-medium min-w-[150px]">
          {periodRangeStr}
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Select period"
        className="max-h-80 overflow-y-auto"
        items={availablePeriods}
        onAction={(key) => handleSelectDate(key as string)}
      >
        {(item) => (
          <DropdownItem key={item.date}>
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
