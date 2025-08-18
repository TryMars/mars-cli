import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { findModelById, getAvailableModels } from "./agents.ts";
import { Anthropic } from "./providers/anthropic.ts";

describe("agents", () => {
  const availableModels = getAvailableModels();

  describe("getAvailableModels", () => {
    it("includes anthropic", () => {
      const anthropicModels = new Anthropic().getProviderWithModels();

      expect(availableModels).toContainEqual(anthropicModels);
    });
  });

  describe("findModelById", () => {
    it("can query model by id", () => {
      const claudeSonnet4 = findModelById({
        providerId: "anthropic",
        modelId: "claude-sonnet-4-20250514",
      });

      expect(claudeSonnet4).toEqual({
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
      });
    });

    it("throws error if provider doesnt exist", () => {
      expect(() =>
        findModelById({
          providerId: "test-provider",
          modelId: "test-model",
        }),
      ).toThrow("test-provider");
    });

    it("throws error if model doesnt exist", () => {
      expect(() =>
        findModelById({
          providerId: "anthropic",
          modelId: "test-model",
        }),
      ).toThrow("test-model");
    });
  });
});
