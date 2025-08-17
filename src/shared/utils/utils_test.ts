import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { envInTestMode } from "./utils.ts";

describe("shared utils", () => {
  describe("envInTestMode", () => {
    it("returns true when in test mode", () => {
      Deno.env.set("APP_MODE", "test");

      expect(envInTestMode()).toBe(true);
    });

    it("returns false when not in test mode", () => {
      Deno.env.set("APP_MODE", "production");

      expect(envInTestMode()).toBe(false);
    });
  });
});
