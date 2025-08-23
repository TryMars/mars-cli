import { describe, it } from "@std/testing/bdd";
import { getAgentInstanceByProviderId } from "#agents/agents.ts";
import {
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import {
  CreateMessageProps,
  Message,
} from "#context/message_context/message_context_types.ts";
import { stub } from "jsr:@std/testing/mock";
import { ANY_TODO } from "#shared/types.ts";
import { expect } from "@std/expect/expect";
import { Anthropic } from "./anthropic.ts";
import { agentsMessages } from "#agents/agents_messages.ts";

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
        agentsMessages.error.model_not_found(testModel),
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
          agentsMessages.error.cleanup_not_in_test_mode(),
        );
      } finally {
        envStub.restore();
      }
    });
  });

  describe("convertToLLMMessages", () => {
    const agent = Anthropic.getInstance(defaultAssistantModelId);

    it("converts empty messages array", () => {
      const result = agent.convertToLLMMessages([]);
      expect(result).toEqual([]);
    });

    it("converts single user message", () => {
      const messages = [
        {
          id: "1",
          from: "user",
          content: "Hello",
          timestamp: new Date(),
          state: "neutral",
        } as Message,
      ];

      const result = agent.convertToLLMMessages(messages);

      expect(result).toEqual([
        {
          role: "user",
          content: "Hello",
        },
      ]);
    });

    it("converts single assistant message", () => {
      const messages = [
        {
          id: "2",
          from: "assistant",
          content: "Hi there!",
          timestamp: new Date(),
          state: "success",
        } as Message,
      ];

      const result = agent.convertToLLMMessages(messages);

      expect(result).toEqual([
        {
          role: "assistant",
          content: "Hi there!",
        },
      ]);
    });

    it("converts multiple messages in order", () => {
      const messages = [
        {
          id: "1",
          from: "user",
          content: "What's 2+2?",
          timestamp: new Date(),
          state: "neutral",
        },
        {
          id: "2",
          from: "assistant",
          content: "2+2 equals 4",
          timestamp: new Date(),
          state: "success",
        },
        {
          id: "3",
          from: "user",
          content: "Thank you!",
          timestamp: new Date(),
          state: "neutral",
        },
      ] as Message[];

      const result = agent.convertToLLMMessages(messages);

      expect(result).toEqual([
        { role: "user", content: "What's 2+2?" },
        { role: "assistant", content: "2+2 equals 4" },
        { role: "user", content: "Thank you!" },
      ]);
    });
  });

  describe("createResponse", () => {
    const agent = getAgentInstanceByProviderId({
      providerId: defaultAssistantProviderId,
      modelId: defaultAssistantModelId,
    });

    // ------------------------------ begin LLM context setup

    let message: string = "";
    let isLoading: boolean = true;
    let contextWindowUsage: number = 0;
    let usageCost: number = 0;

    const addMessage = (createMessage: CreateMessageProps) =>
      (message = createMessage.content);

    const setContextWindowUsage = (usage: number) =>
      (contextWindowUsage = usage);

    const setUsageCost = (cost: number) => (usageCost = cost);

    const setIsLoading = (loading: boolean) => (isLoading = loading);

    // ------------------------------ end LLM context setup

    // ------------------------------ begin mock response setup

    const mockedResponseContent = "Hello! This is mocked content.";

    const mockedResponse = {
      id: "msg_01LF55udgebPY2ht18PWYFEQ",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-4-20250514",
      content: [
        {
          type: "text",
          text: mockedResponseContent,
        },
      ],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: 30000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
        cache_creation: {
          ephemeral_5m_input_tokens: 0,
          ephemeral_1h_input_tokens: 0,
        },
        output_tokens: 20000,
        service_tier: "standard",
      },
    };

    // ------------------------------ end mocked response setup

    it("can get a response", async () => {
      const getStreamedEventsFull = stub(agent, "createLLMMessage", () => {
        return Promise.resolve(mockedResponse) as ANY_TODO;
      });

      try {
        await agent.createResponse({
          content: "hello there",
          messages: [],
          addMessage,
          setContextWindowUsage,
          setUsageCost,
          setIsLoading,
        });

        expect(message).toBe(mockedResponseContent);
        expect(contextWindowUsage).toBe(25);
        expect(usageCost).toBe(39);
        expect(isLoading).toBeFalsy();
      } finally {
        getStreamedEventsFull.restore();
      }
    });
  });
});
