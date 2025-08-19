import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { envInTestMode, getHomeDir } from "./utils.ts";
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
});
