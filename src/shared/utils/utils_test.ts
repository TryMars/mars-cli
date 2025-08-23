import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { envInTestMode, formatCentsForDisplay, getHomeDir } from "./utils.ts";
import { stub } from "@std/testing/mock";

describe("shared utils", () => {
  describe("envInTestMode", () => {
    it("returns true when in test mode", () => {
      expect(envInTestMode()).toBe(true);
    });

    it("returns false when in production mode", () => {
      // Mock APP_MODE to be production
      const envStub = stub(Deno.env, "get", (key: string) => {
        if (key === "APP_MODE") return "production";
        return Deno.env.get.call(Deno.env, key);
      });

      try {
        expect(envInTestMode()).toBe(false);
      } finally {
        envStub.restore();
      }
    });
  });

  describe("getHomeDir", () => {
    it("returns tests/storage when in test mode", () => {
      expect(getHomeDir()).toContain("/tests/storage");
    });

    it("returns home path when in production mode", () => {
      const homeDir = Deno.env.get("HOME");

      // Mock APP_MODE to be production
      const envStub = stub(Deno.env, "get", (key: string) => {
        if (key === "APP_MODE") return "production";
        if (key === "HOME") return homeDir;
        return Deno.env.get.call(Deno.env, key);
      });

      try {
        expect(getHomeDir()).toContain(homeDir);
        expect(getHomeDir()).not.toContain("/tests/storage");
      } finally {
        envStub.restore();
      }
    });
  });

  describe("formatCentsForDisplay", () => {
    it("returns 0.00 if cents is 0", () => {
      expect(formatCentsForDisplay(0)).toBe("$0.00");
    });

    it("returns up to 4 decimals if less than 1 cent but grater than 0", () => {
      expect(formatCentsForDisplay(0.05)).toBe("$0.0005");
      expect(formatCentsForDisplay(0.5)).toBe("$0.005");
    });

    it("returns cents formatted as dollars correctly", () => {
      expect(formatCentsForDisplay(10)).toBe("$0.10");
      expect(formatCentsForDisplay(405)).toBe("$4.05");
    });
  });
});
