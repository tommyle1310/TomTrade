import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

// Helper function to format dates
const formatDate = (date: Date): string => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const DateRangePicker = ({
  date1,
  setDate1,
  date2,
  setDate2,
}: {
  date1: Date;
  setDate1: React.Dispatch<React.SetStateAction<Date>>;
  date2: Date;
  setDate2: React.Dispatch<React.SetStateAction<Date>>;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Select Date Range</Button>
      </PopoverTrigger>
      <PopoverContent className="">
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
          {/* Start Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  {formatDate(date1)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date1}
                  onSelect={(date) => date && setDate1(date)}
                  initialFocus
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Separator */}
          <div className="flex items-center text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-4 text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  {formatDate(date2)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date2}
                  onSelect={(date) => date && setDate2(date)}
                  initialFocus
                  className="rounded-md border-0"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const thirtyDaysAgo = new Date(
                  today.getTime() - 30 * 24 * 60 * 60 * 1000
                );
                setDate1(thirtyDaysAgo);
                setDate2(today);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              30D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const sevenDaysAgo = new Date(
                  today.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                setDate1(sevenDaysAgo);
                setDate2(today);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              7D
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(
                  today.getTime() - 24 * 60 * 60 * 1000
                );
                setDate1(yesterday);
                setDate2(today);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              1D
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
