import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { stub } from "jsr:@std/testing/mock";
import { CreateMessageProps } from "#context/message_context/message_context_types.ts";
import { TokenUsage } from "#llm/agents/agents_types.ts";
import { getAgentInstanceByProviderId } from "#llm/llm.ts";
import {
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { BaseAgentTestConfig } from "./base_agent_test_types.ts";

/**
 * Creates shared test context setup functions
 */
export function createTestContext() {
  let message: string = "";
  let isLoading: boolean = true;
  let contextWindowUsage: number = 0;
  let usageCost: number = 0;

  const addMessage = (createMessage: CreateMessageProps) =>
    (message = createMessage.content);

  const setContextWindowUsage = (usage: number) => (contextWindowUsage = usage);

  const setUsageCost = (cost: number) => (usageCost = cost);

  const setIsLoading = (loading: boolean) => (isLoading = loading);

  const getState = () => ({
    message,
    isLoading,
    contextWindowUsage,
    usageCost,
  });

  const resetState = () => {
    message = "";
    isLoading = true;
    contextWindowUsage = 0;
    usageCost = 0;
  };

  return {
    addMessage,
    setContextWindowUsage,
    setUsageCost,
    setIsLoading,
    getState,
    resetState,
  };
}

/**
 * Runs shared BaseAgent tests that should work for any provider
 */
export const runBaseAgentTests = (config: BaseAgentTestConfig) => {
  describe("createResponse", () => {
    it("can get a response and handle token usage correctly", async () => {
      const context = createTestContext();

      const createLLMMessageStub = stub(
        config.agent,
        "createLLMMessage",
        () => {
          return Promise.resolve(config.mockLLMResponse) as Promise<object>;
        },
      );

      try {
        await config.agent.createResponse({
          content: "hello there",
          messages: [],
          addMessage: context.addMessage,
          setContextWindowUsage: context.setContextWindowUsage,
          setUsageCost: context.setUsageCost,
          setIsLoading: context.setIsLoading,
        });

        const state = context.getState();

        expect(state.message).toBe(config.expectedContent);
        expect(state.contextWindowUsage).toBe(
          config.expectedContextWindowUsage,
        );
        expect(state.usageCost).toBe(config.expectedUsageCost);
        expect(state.isLoading).toBeFalsy();
      } finally {
        createLLMMessageStub.restore();
      }
    });

    it("sets loading to false after response", async () => {
      const context = createTestContext();

      const createLLMMessageStub = stub(
        config.agent,
        "createLLMMessage",
        () => {
          return Promise.resolve(config.mockLLMResponse) as Promise<object>;
        },
      );

      try {
        expect(context.getState().isLoading).toBe(true);

        await config.agent.createResponse({
          content: "test message",
          messages: [],
          addMessage: context.addMessage,
          setContextWindowUsage: context.setContextWindowUsage,
          setUsageCost: context.setUsageCost,
          setIsLoading: context.setIsLoading,
        });

        expect(context.getState().isLoading).toBe(false);
      } finally {
        createLLMMessageStub.restore();
      }
    });

    it("calculates context window usage correctly", async () => {
      const context = createTestContext();

      const createLLMMessageStub = stub(
        config.agent,
        "createLLMMessage",
        () => {
          return Promise.resolve(config.mockLLMResponse) as Promise<object>;
        },
      );

      try {
        await config.agent.createResponse({
          content: "test message",
          messages: [],
          addMessage: context.addMessage,
          setContextWindowUsage: context.setContextWindowUsage,
          setUsageCost: context.setUsageCost,
          setIsLoading: context.setIsLoading,
        });

        const state = context.getState();

        expect(state.contextWindowUsage).toBe(
          config.expectedContextWindowUsage,
        );
      } finally {
        createLLMMessageStub.restore();
      }
    });

    it("calculates usage cost correctly", async () => {
      const context = createTestContext();

      const createLLMMessageStub = stub(
        config.agent,
        "createLLMMessage",
        () => {
          return Promise.resolve(config.mockLLMResponse) as Promise<object>;
        },
      );

      try {
        await config.agent.createResponse({
          content: "test message",
          messages: [],
          addMessage: context.addMessage,
          setContextWindowUsage: context.setContextWindowUsage,
          setUsageCost: context.setUsageCost,
          setIsLoading: context.setIsLoading,
        });

        const state = context.getState();

        expect(state.usageCost).toBe(config.expectedUsageCost);
      } finally {
        createLLMMessageStub.restore();
      }
    });
  });
};

describe("base agent (via anthropic)", () => {
  const agent = getAgentInstanceByProviderId({
    providerId: defaultAssistantProviderId,
    modelId: defaultAssistantModelId,
  });

  // cast to access protected methods
  // deno-lint-ignore no-explicit-any
  const baseAgent = agent as any;

  describe("calculateContextWindowUsage", () => {
    it("calculates total token usage correctly", () => {
      const tokenUsage: TokenUsage = {
        inputTokens: 1000,
        outputTokens: 500,
        cacheReadTokens: 100,
        cacheWriteTokens: 50,
      };

      const result = baseAgent.calculateContextWindowUsage(tokenUsage);
      expect(result).toBe(1650); // 1000 + 500 + 100 + 50
    });

    it("handles missing cache tokens", () => {
      const tokenUsage: TokenUsage = {
        inputTokens: 1000,
        outputTokens: 500,
      };

      const result = baseAgent.calculateContextWindowUsage(tokenUsage);
      expect(result).toBe(1500); // 1000 + 500 + 0 + 0
    });
  });

  describe("calculateContextWindowPercentage", () => {
    it("calculates percentage correctly", () => {
      const contextWindowUsage = 50000;
      const result =
        baseAgent.calculateContextWindowPercentage(contextWindowUsage);
      expect(result).toBe(25); // (50000 / 200000) * 100 = 25% (Claude Sonnet 4 has 200k context window)
    });

    it("rounds to 1 decimal place", () => {
      const contextWindowUsage = 66666;
      const result =
        baseAgent.calculateContextWindowPercentage(contextWindowUsage);
      expect(result).toBe(33.3); // (66666 / 200000) * 100 = 33.333, rounded to 33.3
    });
  });

  describe("calculateCost", () => {
    it("calculates cost correctly with all token types", () => {
      const tokenUsage: TokenUsage = {
        inputTokens: 1000000,
        outputTokens: 500000,
        cacheReadTokens: 100000,
        cacheWriteTokens: 50000,
      };

      const result = baseAgent.calculateCost(tokenUsage);
      expect(result).toBe(1071.75);
    });

    it("calculates cost without cache tokens", () => {
      const tokenUsage: TokenUsage = {
        inputTokens: 1000000,
        outputTokens: 500000,
      };

      const result = baseAgent.calculateCost(tokenUsage);
      expect(result).toBe(1050);
    });

    it("uses fallback pricing when cache costs are undefined", () => {
      const originalPricing = baseAgent.model.pricing;

      baseAgent.model.pricing = {
        input_cost: 300,
        output_cost: 1500,
        cache_read_cost: undefined,
        cache_write_cost: undefined,
      };

      try {
        const tokenUsage: TokenUsage = {
          inputTokens: 1000000,
          outputTokens: 0,
          cacheReadTokens: 100000,
          cacheWriteTokens: 50000,
        };

        const result = baseAgent.calculateCost(tokenUsage);
        expect(result).toBe(345);
      } finally {
        baseAgent.model.pricing = originalPricing;
      }
    });
  });

  describe("handleUsage", () => {
    it("sets context window usage and cost correctly", () => {
      let contextWindowUsage = 0;
      let usageCost = 0;

      const setContextWindowUsage = (usage: number) =>
        (contextWindowUsage = usage);
      const setUsageCost = (cost: number) => (usageCost = cost);

      const tokenUsage: TokenUsage = {
        inputTokens: 10000,
        outputTokens: 5000,
        cacheReadTokens: 1000,
        cacheWriteTokens: 500,
      };

      baseAgent.handleUsage({
        setContextWindowUsage,
        setUsageCost,
        tokenUsage,
      });

      expect(contextWindowUsage).toBe(8.3);
      expect(usageCost).toBe(10.7175);
    });
  });
});
