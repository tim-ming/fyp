import { addDays, format } from "date-fns";

export const getStatus = (value: number) => {
  if (value < 0.2) return "horrible";
  if (value < 0.4) return "bad";
  if (value < 0.6) return "fine";
  if (value < 0.85) return "well";
  return "excellent";
};

// export const daysAfter = (days: number) => (date: Date) => addDays(date, days);

// export const getMonth = (month: number) => {
//   const date = new Date(2021, month, 1); // Using a fixed year and day
//   return format(date, "MMM");
// };

// export const getDay = (day: number) => {
//   const date = new Date(2021, 0, day + 3); // Using a fixed year and month, adding 3 to align with the day of the week
//   return format(date, "EEEE").toUpperCase();
// };
