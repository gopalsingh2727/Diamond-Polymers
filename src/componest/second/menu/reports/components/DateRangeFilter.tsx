/**
 * Date Range Filter - Pure CSS Version
 * NO TAILWIND - NO SHADCN
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./pure";
import { useState, useEffect } from "react";

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface DateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  onPresetChange?: (preset: string) => void;
}

export function DateRangeFilter({ onDateRangeChange, onPresetChange }: DateRangeFilterProps) {
  const [preset, setPreset] = useState("last30days");

  const handlePresetChange = (value: string) => {
    setPreset(value);
    
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = today;

    switch (value) {
      case "today":
        from = today;
        to = today;
        break;
      case "yesterday":
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        to = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        break;
      case "last7days":
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        break;
      case "last30days":
        from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "lastMonth":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        from = lastMonth;
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case "last3months":
        from = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break;
      case "last6months":
        from = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        break;
      case "thisYear":
        from = new Date(today.getFullYear(), 0, 1);
        break;
      case "lastYear":
        from = new Date(today.getFullYear() - 1, 0, 1);
        to = new Date(today.getFullYear() - 1, 11, 31);
        break;
      case "allTime":
        from = new Date(2020, 0, 1); // Start from 2020
        break;
    }

    onDateRangeChange({ from, to });
    
    if (onPresetChange) {
      onPresetChange(value);
    }
  };

  // Initialize with default date range on mount
  useEffect(() => {
    const today = new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
    const to = today;
    onDateRangeChange({ from, to });
    if (onPresetChange) {
      onPresetChange("last30days");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex gap-2">
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger style={{ width: '200px' }}>
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="yesterday">Yesterday</SelectItem>
          <SelectItem value="last7days">Last 7 Days</SelectItem>
          <SelectItem value="last30days">Last 30 Days</SelectItem>
          <SelectItem value="thisMonth">This Month</SelectItem>
          <SelectItem value="lastMonth">Last Month</SelectItem>
          <SelectItem value="last3months">Last 3 Months</SelectItem>
          <SelectItem value="last6months">Last 6 Months</SelectItem>
          <SelectItem value="thisYear">This Year</SelectItem>
          <SelectItem value="lastYear">Last Year</SelectItem>
          <SelectItem value="allTime">All Time</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
