import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  calculateElapsedSeconds,
  formatTime,
} from "./loading_indicator_utils.ts";

describe("loading indicator utils", () => {
  describe("formatTime", () => {
    it("formats time under 60 seconds correctly", () => {
      expect(formatTime(45)).toBe("45s");
      expect(formatTime(0)).toBe("0s");
      expect(formatTime(59)).toBe("59s");
    });

    it("formats time over 60 seconds with minutes and seconds", () => {
      expect(formatTime(60)).toBe("1m 0s");
      expect(formatTime(90)).toBe("1m 30s");
      expect(formatTime(125)).toBe("2m 5s");
    });

    it("handles edge cases correctly", () => {
      expect(formatTime(3600)).toBe("60m 0s");
      expect(formatTime(3599)).toBe("59m 59s");
    });
  });

  describe("calculateElapsedSeconds", () => {
    it("calculates zero seconds elapsed for same time", () => {
      const time = new Date("2023-01-01T00:00:00Z");
      expect(
        calculateElapsedSeconds({ startTime: time, currentTime: time }),
      ).toBe(0);
    });

    it("calculates correct seconds for 1 minute difference", () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2023-01-01T00:01:00Z");
      expect(
        calculateElapsedSeconds({
          startTime: start,
          currentTime: end,
        }),
      ).toBe(60);
    });

    it("rounds down to nearest second", () => {
      const start = new Date("2023-01-01T00:00:00Z");
      const end = new Date("2023-01-01T00:00:01.999Z");
      expect(
        calculateElapsedSeconds({
          startTime: start,
          currentTime: end,
        }),
      ).toBe(1);
    });
  });
});
