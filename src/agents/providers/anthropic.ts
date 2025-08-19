import {
  ProviderWithModels,
  StreamResponseProps,
} from "#agents/agent_types.ts";
import { AgentInterface } from "#agents/agent_interface.ts";
import { Anthropic as AnthropicClient } from "@anthropic-ai/sdk";
import { agentsMessages } from "#agents/agents_messages.ts";
import { envInTestMode } from "#shared/utils/utils.ts";

export class Anthropic implements AgentInterface {
  private static instance: Anthropic | null;

  private client: AnthropicClient;
  private modelId: string;

  private constructor(modelId: string) {
    this.modelId = modelId;
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

      Anthropic.instance = new Anthropic(modelId);
    }

    return Anthropic.instance;
  }

  static getProviderWithModels(): ProviderWithModels {
    return {
      id: "anthropic",
      name: "Anthropic",
      models: [
        {
          id: "claude-opus-4-1-20250805",
          name: "Claude Opus 4.1",
        },
        {
          id: "claude-opus-4-20250514",
          name: "Claude Opus 4",
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude Opus 3",
        },
        {
          id: "claude-sonnet-4-20250514",
          name: "Claude Sonnet 4",
        },
        {
          id: "claude-3-7-sonnet-20250219",
          name: "Claude Sonnet 3.7",
        },
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude Sonnet 3.5 v2",
        },
        {
          id: "claude-3-5-sonnet-20240620",
          name: "Claude Sonnet 3.5",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude Haiku 3",
        },
        {
          id: "claude-3-5-haiku-20241022",
          name: "Claude Haiku 3.5",
        },
      ],
    };
  }

  async getStreamedEvents(content: string) {
    return await this.client.messages.create({
      max_tokens: 1024,
      messages: [{ role: "user", content }],
      model: this.modelId,
      stream: true,
    });
  }

  async streamResponse({
    content,
    addMessage,
    setCurrentlyStreamedMessage,
    setIsLoading,
  }: StreamResponseProps) {
    let message: string = "";

    const stream = await this.getStreamedEvents(content);

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
      }
    }

    setIsLoading(false);
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
