import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  findModelById,
  getAgentInstanceByProviderId,
  getAvailableModels,
  getAvailableTools,
} from "./llm.ts";
import { Anthropic } from "./agents/anthropic/anthropic.ts";
import {
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { llmMessages } from "./llm_messages.ts";
import { Model } from "./agents/agents_types.ts";
import { AnthropicConfig } from "./agents/anthropic/anthropic_config.ts";
import { SearchCWDConfig } from "./tools/search_cwd/search_cwd_config.ts";

describe("agents", () => {
  describe("getAvailableModels", () => {
    it("includes anthropic", () => {
      expect(getAvailableModels()).toContainEqual({
        id: AnthropicConfig.id,
        name: AnthropicConfig.name,
        models: AnthropicConfig.models,
      });
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
        contextWindow: 200000,
        pricing: {
          input_cost: 300,
          output_cost: 1500,
          cache_read_cost: 30,
          cache_write_cost: 375,
        },
      } as Model);
    });

    it("throws error if provider doesnt exist", () => {
      const testProvider = "test-provider";

      expect(() =>
        findModelById({
          providerId: testProvider,
          modelId: "test-model",
        }),
      ).toThrow(llmMessages.error.provider_not_found(testProvider));
    });

    it("throws error if model doesnt exist", () => {
      const testModel = "test-model";

      expect(() =>
        findModelById({
          providerId: "anthropic",
          modelId: testModel,
        }),
      ).toThrow(llmMessages.error.model_not_found(testModel));
    });
  });

  describe("getAgentInstanceByProviderId", () => {
    it("returns instance of agent", () => {
      const agent = getAgentInstanceByProviderId({
        providerId: defaultAssistantProviderId,
        modelId: defaultAssistantModelId,
      });

      expect(agent).toEqual(Anthropic.getInstance(defaultAssistantModelId));
    });

    it("returns error if provider doesnt exist", () => {
      const testProvider = "test-provider-12345";

      expect(() =>
        getAgentInstanceByProviderId({
          providerId: testProvider,
          modelId: defaultAssistantModelId,
        }),
      ).toThrow(llmMessages.error.provider_not_found(testProvider));
    });
  });

  describe("getAvailableTools", () => {
    it("includes find_file", () => {
      expect(getAvailableTools()).toContainEqual(SearchCWDConfig.schema);
    });
  });
});
