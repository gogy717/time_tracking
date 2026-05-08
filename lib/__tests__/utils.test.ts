import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatTimer,
  calcWeeklyGoal,
  predictMilestone,
  getStartOfWeek,
} from "../utils";

describe("formatDuration", () => {
  it("returns minutes only when less than 1h", () => {
    expect(formatDuration(45)).toBe("45m");
  });
  it("returns hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });
  it("handles 0", () => {
    expect(formatDuration(0)).toBe("0m");
  });
  it("handles exact hours", () => {
    expect(formatDuration(120)).toBe("2h 0m");
  });
});

describe("formatTimer", () => {
  it("formats seconds correctly", () => {
    expect(formatTimer(0)).toBe("00:00:00");
    expect(formatTimer(61)).toBe("00:01:01");
    expect(formatTimer(3661)).toBe("01:01:01");
  });
});

describe("calcWeeklyGoal", () => {
  it("returns fallback when no targetDate", () => {
    expect(calcWeeklyGoal(0, null, 15)).toBe(15);
  });
  it("returns fallback for past target date", () => {
    const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    expect(calcWeeklyGoal(0, pastDate, 15)).toBe(15);
  });
  it("calculates correctly for future date", () => {
    // 1000 hours remaining, 50 weeks away → 20h/week
    const futureDate = new Date(Date.now() + 50 * 7 * 24 * 60 * 60 * 1000);
    const totalMinutes = (10000 - 1000) * 60; // already done 9000h
    const result = calcWeeklyGoal(totalMinutes, futureDate, 10);
    expect(result).toBeCloseTo(20, 0);
  });
  it("enforces minimum of 1h", () => {
    const futureDate = new Date(Date.now() + 10000 * 7 * 24 * 60 * 60 * 1000);
    expect(calcWeeklyGoal(0, futureDate, 10)).toBeGreaterThanOrEqual(1);
  });
});

describe("predictMilestone", () => {
  it("returns null when weeklyAvg is 0", () => {
    expect(predictMilestone(0, 3000, 0)).toBeNull();
  });
  it("returns null when already reached", () => {
    expect(predictMilestone(3000 * 60, 3000, 60)).toBeNull();
  });
  it("returns a future date when not yet reached", () => {
    const result = predictMilestone(0, 100, 10 * 60); // 10h/week, need 100h
    expect(result).not.toBeNull();
    expect(result!.getTime()).toBeGreaterThan(Date.now());
  });
});

describe("getStartOfWeek", () => {
  it("returns a Monday", () => {
    const d = getStartOfWeek();
    expect(d.getDay()).toBe(1); // Monday
  });
  it("returns midnight", () => {
    const d = getStartOfWeek();
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});
