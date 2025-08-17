import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { envInTestMode, getHomeDir } from "./utils.ts";

describe("shared utils", () => {
  describe("envInTestMode", () => {
    it("returns true when in test mode", () => {
      Deno.env.set("APP_MODE", "test");

      expect(envInTestMode()).toBe(true);
    });

    it("returns false when in production mode", () => {
      Deno.env.set("APP_MODE", "production");

      expect(envInTestMode()).toBe(false);
    });
  });

  describe("getHomeDir", () => {
    it("returns tests/storage when in test mode", () => {
      Deno.env.set("APP_MODE", "test");

      expect(getHomeDir()).toContain("/tests/storage");
    });

    it("returns home path when in production mode", () => {
      Deno.env.set("APP_MODE", "production");

      expect(getHomeDir()).toContain(Deno.env.get("HOME"));
      expect(getHomeDir()).not.toContain("/tests/storage");
    });
  });
});
