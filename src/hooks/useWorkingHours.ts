import { useMemo } from "react";
import { WorkingHours, Weekday, DayHours } from "../types/salon";
import { formatDisplayTimeRange } from "../utils/dateUtils";

const WEEKDAYS: Weekday[] = [
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
];

export interface TodayStatus {
  today: DayHours;
  isOpenNow: boolean;
  displayHours: string; // e.g. "9:00 AM – 9:00 PM"
}

// NOTE: uses client Date only for display/status on this read-only landing page.
// Real booking-window enforcement always happens server-side (Cloud Functions) per 01-Requirements.
export function useWorkingHours(workingHours: WorkingHours): TodayStatus {
  return useMemo(() => {
    const now = new Date();
    const dayKey = WEEKDAYS[now.getDay()];
    const today = workingHours[dayKey];

    const [openH, openM] = today.openTime.split(":").map(Number);
    const [closeH, closeM] = today.closeTime.split(":").map(Number);
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    const isOpenNow = !today.isClosed && minutesNow >= openMinutes && minutesNow < closeMinutes;

    return {
      today,
      isOpenNow,
      displayHours: formatDisplayTimeRange(today.openTime, today.closeTime),
    };
  }, [workingHours]);
}