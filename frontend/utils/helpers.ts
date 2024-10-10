import { isToday, isYesterday, format } from "date-fns";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const getDayOfWeek = (date: string): string => {
  if (isToday(date)) {
    return "today";
  }
  if (isYesterday(date)) {
    return "yesterday";
  }
  return format(date, "EEEE"); // Returns the day of the week, e.g., 'Monday'
};

export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
