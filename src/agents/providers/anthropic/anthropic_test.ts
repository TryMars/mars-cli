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

  describe("streamResponse", () => {
    const agent = getAgentInstanceByProviderId({
      providerId: defaultAssistantProviderId,
      modelId: defaultAssistantModelId,
    });

    let message: string = "";
    let currentlyStreamedMessage: string = "This should be empty at the end";
    let isLoading: boolean = true;

    const addMessage = (createMessage: CreateMessageProps) =>
      (message = createMessage.content);

    const setCurrentlyStreamedMessage = (content: string) =>
      (currentlyStreamedMessage = content);

    const setIsLoading = (loading: boolean) => (isLoading = loading);

    const mockedResponseContent1 = "Hello! This is ";
    const mockedResponseContent2 = "mocked content.";

    const mockedContentBlockDeltas = [
      {
        type: "content_block_delta",
        delta: {
          type: "text_delta",
          text: mockedResponseContent1,
        },
      },
      {
        type: "content_block_delta",
        delta: {
          type: "text_delta",
          text: mockedResponseContent2,
        },
      },
    ];

    it("can stream a partial response", async () => {
      // we're not returning the message_delta event to simulate
      // a partial response, as the message_delta event is sent when
      // the message has finished streaming
      const getStreamedEventsPartial = stub(agent, "getStreamedEvents", () => {
        return Promise.resolve(mockedContentBlockDeltas) as ANY_TODO;
      });

      try {
        await agent.streamResponse({
          content: "hello there",
          messages: [],
          addMessage,
          setCurrentlyStreamedMessage,
          setIsLoading,
        });

        // should still be blank as it only gets set
        // when streaming is complete for it.
        expect(message).toEqual("");

        // should have the message still, since it gets
        // cleared after streaming is complete for this message
        expect(currentlyStreamedMessage).toBe(
          mockedResponseContent1 + mockedResponseContent2,
        );

        expect(isLoading).toBeFalsy();
      } finally {
        // clear the partial mock so we can mock again
        getStreamedEventsPartial.restore();
      }
    });

    it("can get a final response", async () => {
      // add message_delta as well to simulate a finished message
      const getStreamedEventsFull = stub(agent, "getStreamedEvents", () => {
        return Promise.resolve([
          ...mockedContentBlockDeltas,
          { type: "message_delta" },
        ]) as ANY_TODO;
      });

      try {
        await agent.streamResponse({
          content: "hello there",
          messages: [],
          addMessage,
          setCurrentlyStreamedMessage,
          setIsLoading,
        });

        // should have the full message since the message finished streaming
        expect(message).toBe(mockedResponseContent1 + mockedResponseContent2);

        // should be empty since we clear the streaming message
        // after its fully streamed
        expect(currentlyStreamedMessage).toEqual("");

        expect(isLoading).toBeFalsy();
      } finally {
        getStreamedEventsFull.restore();
      }
    });
  });
});
