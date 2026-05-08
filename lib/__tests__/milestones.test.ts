import { describe, it, expect } from "vitest";
import { pick3Milestones, LADDER } from "../milestones";

describe("pick3Milestones", () => {
  it("returns all upcoming when 3 or fewer remain", () => {
    // 9000h done, target 10000h → only one milestone (10000h)
    const { key } = pick3Milestones(9000, 10000);
    expect(key.length).toBeLessThanOrEqual(3);
    expect(key[key.length - 1].hours).toBe(10000);
  });

  it("returns at most 3 key milestones", () => {
    const { key } = pick3Milestones(0, 10000);
    expect(key.length).toBeLessThanOrEqual(3);
  });

  it("key milestones are in ascending order", () => {
    const { key } = pick3Milestones(0, 10000);
    for (let i = 1; i < key.length; i++) {
      expect(key[i].hours).toBeGreaterThan(key[i - 1].hours);
    }
  });

  it("completed milestones are all <= currentHours", () => {
    const { completed } = pick3Milestones(1500, 10000);
    completed.forEach(m => expect(m.hours).toBeLessThanOrEqual(1500));
  });

  it("key milestones are all > currentHours", () => {
    const { key } = pick3Milestones(1500, 10000);
    key.forEach(m => expect(m.hours).toBeGreaterThan(1500));
  });

  it("includes the target milestone in key", () => {
    const { key } = pick3Milestones(0, 5000);
    const hasTarget = key.some(m => m.hours === 5000);
    expect(hasTarget).toBe(true);
  });

  it("returns empty key when target is reached", () => {
    const { key } = pick3Milestones(10000, 10000);
    expect(key.length).toBe(0);
  });

  it("handles non-standard target hours", () => {
    const { key } = pick3Milestones(0, 1500);
    expect(key.length).toBeGreaterThan(0);
    expect(key[key.length - 1].hours).toBe(1500);
  });
});

describe("LADDER", () => {
  it("is sorted in ascending order", () => {
    for (let i = 1; i < LADDER.length; i++) {
      expect(LADDER[i].hours).toBeGreaterThan(LADDER[i - 1].hours);
    }
  });

  it("has 8 milestones", () => {
    expect(LADDER.length).toBe(8);
  });
});
