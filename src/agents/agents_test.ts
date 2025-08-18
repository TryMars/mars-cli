import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { getAvailableModels } from "./agents.ts";
import { Anthropic } from "./providers/anthropic.ts";

describe("agents", () => {
  const availableModels = getAvailableModels();

  describe("available providers with models", () => {
    it("includes anthropic", () => {
      const anthropicModels = new Anthropic().getProviderWithModels();

      expect(availableModels).toContainEqual(anthropicModels);
    });
  });
});
