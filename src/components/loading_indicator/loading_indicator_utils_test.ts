import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { formatTime } from "./loading_indicator_utils.ts";

describe("loading indicator utils", () => {
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
