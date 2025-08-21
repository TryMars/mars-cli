import {
  Model,
  ProviderWithModels,
  SetContextWindowUsageProps,
  StreamResponseProps,
} from "#agents/agent_types.ts";
import { AgentInterface } from "#agents/agent_interface.ts";
import { Anthropic as AnthropicClient } from "@anthropic-ai/sdk";
import { agentsMessages } from "#agents/agents_messages.ts";
import { envInTestMode } from "#shared/utils/utils.ts";
import { Message } from "#context/message_context/message_context_types.ts";

export class Anthropic implements AgentInterface {
  private static instance: Anthropic | null;
  private static providerId: string = "anthropic";
  private client: AnthropicClient;

  model: Model;

  private constructor(model: Model) {
    this.model = model;

    this.client = new AnthropicClient();
  }

  static getInstance(modelId: string): Anthropic {
    if (!Anthropic.instance) {
      const model = Anthropic.getProviderWithModels().models.find(
        (model) => model.id === modelId,
      );

      if (!model) {
        throw new TypeError(agentsMessages.error.model_not_found(modelId));
      }

      Anthropic.instance = new Anthropic(model);
    }

    return Anthropic.instance;
  }

  static getProviderWithModels(): ProviderWithModels {
    return {
      id: Anthropic.providerId,
      name: "Anthropic",
      models: [
        {
          id: "claude-opus-4-1-20250805",
          name: "Claude Opus 4.1",
          contextWindow: 200000,
        },
        {
          id: "claude-opus-4-20250514",
          name: "Claude Opus 4",
          contextWindow: 200000,
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude Opus 3",
          contextWindow: 200000,
        },
        {
          id: "claude-sonnet-4-20250514",
          name: "Claude Sonnet 4",
          contextWindow: 200000,
        },
        {
          id: "claude-3-7-sonnet-20250219",
          name: "Claude Sonnet 3.7",
          contextWindow: 200000,
        },
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude Sonnet 3.5 v2",
          contextWindow: 200000,
        },
        {
          id: "claude-3-5-sonnet-20240620",
          name: "Claude Sonnet 3.5",
          contextWindow: 200000,
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude Haiku 3",
          contextWindow: 200000,
        },
        {
          id: "claude-3-5-haiku-20241022",
          name: "Claude Haiku 3.5",
          contextWindow: 200000,
        },
      ],
    };
  }

  convertToLLMMessages(messages: Message[]): AnthropicClient.MessageParam[] {
    return messages.map((message) => ({
      role: message.from as "user" | "assistant",
      content: message.content,
    }));
  }

  async getStreamedEvents(content: string, messages: Message[] = []) {
    return await this.client.messages.create({
      max_tokens: 1024,
      messages: [
        ...this.convertToLLMMessages(messages),
        { role: "user", content },
      ],
      model: this.model.id,
      stream: true,
    });
  }

  async streamResponse({
    content,
    messages,
    addMessage,
    setCurrentlyStreamedMessage,
    setContextWindowUsage,
    setIsLoading,
  }: StreamResponseProps) {
    let message: string = "";

    const stream = await this.getStreamedEvents(content, messages);

    for await (const messageStreamEvent of stream) {
      if (
        messageStreamEvent.type === "content_block_delta" &&
        messageStreamEvent.delta.type === "text_delta"
      ) {
        message += messageStreamEvent.delta.text;

        setCurrentlyStreamedMessage(message);
      }

      if (messageStreamEvent.type === "message_delta" && message) {
        setCurrentlyStreamedMessage("");

        addMessage({
          content: message,
          from: "assistant",
        });

        message = "";

        this.setContextWindowUsage({
          setContextWindowUsage,
          tokenUsage: messageStreamEvent.usage,
        });
      }
    }

    setIsLoading(false);
  }

  private setContextWindowUsage({
    setContextWindowUsage,
    tokenUsage,
  }: SetContextWindowUsageProps) {
    const contextWindowUsage =
      Number(tokenUsage.input_tokens) +
      Number(tokenUsage.output_tokens) +
      Number(tokenUsage.cache_read_input_tokens) +
      Number(tokenUsage.cache_creation_input_tokens);

    setContextWindowUsage(
      Math.round((contextWindowUsage / this.model.contextWindow) * 100 * 10) /
        10,
    );

    // TODO: check a threshhold, and if we are approaching that threshold, auto compact the context.
  }

  static cleanup(): void {
    if (!envInTestMode()) {
      throw new TypeError(agentsMessages.error.cleanup_not_in_test_mode());
    }

    if (Anthropic.instance) {
      Anthropic.instance = null;
    }
  }
}
