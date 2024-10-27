// Helper functions
import { isToday, isYesterday, format } from "date-fns";

/**
 *  Sleep for a specified number of milliseconds
 * @param ms  The number of milliseconds to sleep
 * @returns  A promise that resolves after the specified number of milliseconds
 */
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 *  Formats the date to be displayed in the header
 * @param date  The date to be formatted
 * @returns  The formatted date
 */
export const getDayOfWeek = (date: string): string => {
  if (isToday(date)) {
    return "today";
  }
  if (isYesterday(date)) {
    return "yesterday";
  }
  return format(date, "EEEE"); // Returns the day of the week, e.g., 'Monday'
};

/**
 *  Capitalizes the first letter of a string
 * @param string  The string to capitalize
 * @returns  The string with the first letter capitalized
 */
export const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
