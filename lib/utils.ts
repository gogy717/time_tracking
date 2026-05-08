import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function predictMilestone(
  currentMinutes: number,
  targetHours: number,
  weeklyAvgMinutes: number
): Date | null {
  if (weeklyAvgMinutes <= 0) return null;
  const remainingMinutes = targetHours * 60 - currentMinutes;
  if (remainingMinutes <= 0) return null;
  const msNeeded = (remainingMinutes / weeklyAvgMinutes) * 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + msNeeded);
}

export function calcWeeklyGoal(
  totalMinutes: number,
  targetDate: Date | null,
  fallback: number,
  targetHours = 10000
): number {
  if (!targetDate) return fallback;
  const remainingHours = Math.max(0, targetHours - totalMinutes / 60);
  const remainingWeeks = (targetDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000);
  if (remainingWeeks <= 0) return fallback;
  return Math.max(1, Math.ceil(remainingHours / remainingWeeks));
}

export function getStartOfWeek(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  // Monday as start of week
  date.setDate(date.getDate() - ((day + 6) % 7));
  return date;
}
