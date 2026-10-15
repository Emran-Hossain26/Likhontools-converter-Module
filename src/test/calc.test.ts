import { describe, it, expect } from "vitest";
import { cgpa, ageBetween } from "@/lib/calc";

describe("cgpa", () => {
  it("credit-weighted average", () => {
    expect(cgpa([{ credit: 3, point: 4 }, { credit: 1, point: 3 }])).toBe(3.75);
  });
});
describe("age", () => {
  it("years months days", () => {
    expect(ageBetween(new Date(2000, 0, 31), new Date(2026, 2, 1))).toMatchObject({ years: 26, months: 1, days: 1 });
  });
});
