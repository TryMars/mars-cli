import { describe, it } from "@std/testing/bdd";
import { getAgentInstanceByProviderId } from "#llm/llm.ts";
import {
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { stub } from "jsr:@std/testing/mock";
import { expect } from "@std/expect/expect";
import { Anthropic } from "./anthropic.ts";
import { llmMessages } from "#llm/llm_messages.ts";
import { runBaseAgentTests } from "#llm/agents/base_agent/base_agent_test.ts";
import { Anthropic as AnthropicClient } from "@anthropic-ai/sdk";
import { Message } from "#context/message_context/message_context_types.ts";
import { BaseAgentTestConfig } from "#llm/agents/base_agent/base_agent_test_types.ts";

describe("anthropic", () => {
  describe("getInstance", () => {
    it("can get a new singleton instance", () => {
      Anthropic.cleanup();

      expect(() =>
        Anthropic.getInstance(defaultAssistantModelId),
      ).not.toThrow();
    });

    it("throws error if model doesnt exist", () => {
      const testModel = "test-model";

      Anthropic.cleanup();

      expect(() => Anthropic.getInstance(testModel)).toThrow(
        llmMessages.error.model_not_found(testModel),
      );
    });
  });

  describe("cleanup", () => {
    it("can clean up in test mode", () => {
      expect(() => Anthropic.cleanup()).not.toThrow();
    });

    it("throws error if not in test mode", () => {
      // Mock APP_MODE to be production
      const envStub = stub(Deno.env, "get", (key: string) => {
        if (key === "APP_MODE") return "production";
        return Deno.env.get.call(Deno.env, key);
      });

      try {
        expect(() => Anthropic.cleanup()).toThrow(
          llmMessages.error.cleanup_not_in_test_mode(),
        );
      } finally {
        envStub.restore();
      }
    });
  });

  const agent = getAgentInstanceByProviderId({
    providerId: defaultAssistantProviderId,
    modelId: defaultAssistantModelId,
  });

  const testConfig: BaseAgentTestConfig = {
    agent,
    mockLLMResponse: {
      id: "msg_01LF55udgebPY2ht18PWYFEQ",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4-20250514",
      content: [
        {
          type: "text",
          text: "Hello! This is mocked content.",
        },
      ],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: 30000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
        output_tokens: 20000,
      },
    } as AnthropicClient.Message,
    expectedContent: "Hello! This is mocked content.",
    expectedContextWindowUsage: 25,
    expectedUsageCost: 39,
  };

  runBaseAgentTests(testConfig);

  describe("createLLMMessage", () => {
    it("correctly extracts content from anthropic response format", async () => {
      const mockedAnthropicResponse = {
        id: "msg_01LF55udgebPY2ht18PWYFEQ",
        type: "message",
        role: "assistant",
        model: "claude-sonnet-4-20250514",
        content: [
          {
            type: "text",
            text: "Hello! This is mocked content.",
          },
        ],
        stop_reason: "end_turn",
        stop_sequence: null,
        usage: {
          input_tokens: 30000,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
          output_tokens: 20000,
        },
      } as AnthropicClient.Message;

      const anthropicInstance = agent as Anthropic;

      const clientStub = stub(
        // cast to access protected properties
        // deno-lint-ignore no-explicit-any
        (anthropicInstance as any).client.messages,
        "create",
        () => Promise.resolve(mockedAnthropicResponse),
      );

      try {
        const response = await anthropicInstance.createLLMMessage(
          "test message",
          [],
        );

        expect(response).toEqual(mockedAnthropicResponse);
      } finally {
        clientStub.restore();
      }
    });
  });

  describe("extractLLMMessageContent", () => {
    // cast to access protected methods
    // deno-lint-ignore no-explicit-any
    const anthropicInstance = agent as any;

    it("extracts text content from single text block", () => {
      const message = {
        content: [
          {
            type: "text",
            text: "This is a test response.",
          },
        ],
      } as AnthropicClient.Message;

      const result = anthropicInstance.extractLLMMessageContent(message);
      expect(result).toBe("This is a test response.");
    });

    it("concatenates multiple text blocks", () => {
      const message = {
        content: [
          {
            type: "text",
            text: "First part. ",
          },
          {
            type: "text",
            text: "Second part.",
          },
        ],
      } as AnthropicClient.Message;

      const result = anthropicInstance.extractLLMMessageContent(message);
      expect(result).toBe("First part. Second part.");
    });
  });

  describe("extractTokenUsage", () => {
    // cast to access protected methods
    // deno-lint-ignore no-explicit-any
    const anthropicInstance = agent as any;

    it("extracts token usage from anthropic message", () => {
      const message = {
        usage: {
          input_tokens: 1000,
          output_tokens: 500,
          cache_creation_input_tokens: 100,
          cache_read_input_tokens: 50,
        },
      } as AnthropicClient.Message;

      const result = anthropicInstance.extractTokenUsage(message);

      expect(result).toEqual({
        inputTokens: 1000,
        outputTokens: 500,
        cacheWriteTokens: 100,
        cacheReadTokens: 50,
      });
    });

    it("handles zero cache tokens", () => {
      const message = {
        usage: {
          input_tokens: 2000,
          output_tokens: 1000,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      } as AnthropicClient.Message;

      const result = anthropicInstance.extractTokenUsage(message);

      expect(result).toEqual({
        inputTokens: 2000,
        outputTokens: 1000,
        cacheWriteTokens: 0,
        cacheReadTokens: 0,
      });
    });
  });

  describe("convertMessages", () => {
    // cast to access protected methods
    // deno-lint-ignore no-explicit-any
    const anthropicInstance = agent as any;

    it("converts empty messages array", () => {
      const result = anthropicInstance.convertMessages([]);
      expect(result).toEqual([]);
    });

    it("converts single message", () => {
      const messages = [
        {
          content: "Hello there!",
          from: "user",
        },
      ] as Message[];

      const result = anthropicInstance.convertMessages(messages);

      expect(result).toEqual([
        {
          role: "user",
          content: "Hello there!",
        },
      ]);
    });

    it("converts multiple messages with different roles", () => {
      const messages = [
        {
          content: "Hello!",
          from: "user",
        },
        {
          content: "Hi there! How can I help you?",
          from: "assistant",
        },
        {
          content: "I need help with coding.",
          from: "user",
        },
      ] as Message[];

      const result = anthropicInstance.convertMessages(messages);

      expect(result).toEqual([
        {
          role: "user",
          content: "Hello!",
        },
        {
          role: "assistant",
          content: "Hi there! How can I help you?",
        },
        {
          role: "user",
          content: "I need help with coding.",
        },
      ]);
    });
  });
});
