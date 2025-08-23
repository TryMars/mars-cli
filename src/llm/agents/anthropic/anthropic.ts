import { Anthropic as AnthropicClient } from "@anthropic-ai/sdk";
import { envInTestMode } from "#shared/utils/utils.ts";
import { Message } from "#context/message_context/message_context_types.ts";
import { AnthropicConfig } from "./anthropic_config.ts";
import { BaseAgent } from "#llm/agents/base_agent/base_agent.ts";
import { Model, TokenUsage } from "#llm/agents/agents_types.ts";
import { llmMessages } from "#llm/llm_messages.ts";

export class Anthropic extends BaseAgent<
  AnthropicClient.Message,
  AnthropicClient.MessageParam
> {
  private static instance: Anthropic | null;
  private client: AnthropicClient;

  private constructor(model: Model) {
    super(model);
    this.client = new AnthropicClient();
  }

  static getInstance(modelId: string): Anthropic {
    if (!Anthropic.instance) {
      const model = AnthropicConfig.models.find(
        (model) => model.id === modelId,
      );

      if (!model) {
        throw new TypeError(llmMessages.error.model_not_found(modelId));
      }

      Anthropic.instance = new Anthropic(model);
    }

    return Anthropic.instance;
  }

  async createLLMMessage(
    content: string,
    messages: Message[] = [],
  ): Promise<AnthropicClient.Message> {
    return await this.client.messages.create({
      max_tokens: 1024,
      messages: [...this.convertMessages(messages), { role: "user", content }],
      model: this.model.id,
    });
  }

  protected convertMessages(
    messages: Message[],
  ): AnthropicClient.MessageParam[] {
    return messages.map((message) => ({
      role: message.from as "user" | "assistant",
      content: message.content,
    }));
  }

  protected extractLLMMessageContent(message: AnthropicClient.Message): string {
    let messageContent: string = "";

    for (const content of message.content) {
      if (content.type === "text") {
        messageContent += content.text;
      } else {
        // TODO: handle tool calls? idk yet
        console.log(message);
      }
    }

    return messageContent;
  }

  protected extractTokenUsage(message: AnthropicClient.Message): TokenUsage {
    return {
      inputTokens: Number(message.usage.input_tokens),
      outputTokens: Number(message.usage.output_tokens),
      cacheReadTokens: Number(message.usage.cache_read_input_tokens),
      cacheWriteTokens: Number(message.usage.cache_creation_input_tokens),
    };
  }

  static cleanup(): void {
    if (!envInTestMode()) {
      throw new TypeError(llmMessages.error.cleanup_not_in_test_mode());
    }

    if (Anthropic.instance) {
      Anthropic.instance = null;
    }
  }
}
