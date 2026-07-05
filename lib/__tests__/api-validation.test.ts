import { describe, expect, it } from "vitest";
import {
  cleanHexColor,
  cleanOptionalString,
  cleanPositiveNumber,
  cleanString,
  parseOptionalDate,
} from "../api-validation";

describe("api validation helpers", () => {
  it("trims and bounds required strings", () => {
    expect(cleanString("  abc  ", 2)).toBe("ab");
    expect(cleanString("   ", 20)).toBeNull();
    expect(cleanString(12, 20)).toBeNull();
  });

  it("handles optional strings", () => {
    expect(cleanOptionalString(undefined, 20)).toBeUndefined();
    expect(cleanOptionalString(null, 20)).toBeNull();
    expect(cleanOptionalString("  note  ", 4)).toBe("note");
    expect(cleanOptionalString("   ", 20)).toBeNull();
  });

  it("accepts only finite positive numbers within bounds", () => {
    expect(cleanPositiveNumber(2, { max: 3 })).toBe(2);
    expect(cleanPositiveNumber(0)).toBeNull();
    expect(cleanPositiveNumber(Number.POSITIVE_INFINITY)).toBeNull();
    expect(cleanPositiveNumber(4, { max: 3 })).toBeNull();
  });

  it("validates hex colors", () => {
    expect(cleanHexColor("#00e5ff")).toBe("#00e5ff");
    expect(cleanHexColor("red", "#ffffff")).toBe("#ffffff");
  });

  it("parses optional dates", () => {
    expect(parseOptionalDate(undefined)).toBeUndefined();
    expect(parseOptionalDate(null)).toBeNull();
    expect(parseOptionalDate("")).toBeNull();
    expect(parseOptionalDate("not-a-date")).toBeUndefined();
    expect(parseOptionalDate("2026-01-01")).toBeInstanceOf(Date);
  });
});
