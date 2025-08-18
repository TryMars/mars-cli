import { describe, it } from "@std/testing/bdd";
import { getAgentInstanceByProviderId } from "../agents.ts";
import {
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { CreateMessageProps } from "#context/message_context/message_context_types.ts";
import { stub } from "jsr:@std/testing/mock";
import { ANY_TODO } from "#shared/types.ts";
import { expect } from "@std/expect/expect";

describe("providers", () => {
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
