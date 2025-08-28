import { Anthropic as AnthropicClient } from "@anthropic-ai/sdk";
import { envInTestMode } from "#shared/utils/utils.ts";
import {
  Message,
  MessageContextState,
} from "#context/message_context/message_context_types.ts";
import { AnthropicConfig } from "./anthropic_config.ts";
import { BaseAgent } from "#llm/agents/base_agent/base_agent.ts";
import { Model, TokenUsage } from "#llm/agents/agents_types.ts";
import { llmMessages } from "#llm/llm_messages.ts";
import { getAvailableTools, getToolInstanceByToolName } from "#llm/llm.ts";
import { ToolConfigSchema } from "#llm/tools/tools_types.ts";

export class Anthropic extends BaseAgent<
  AnthropicClient,
  AnthropicClient.Message,
  AnthropicClient.MessageParam,
  AnthropicClient.Tool
> {
  private static instance: Anthropic | null;
  protected client: AnthropicClient;
  protected messages: AnthropicClient.MessageParam[] = [];

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
    content: string | AnthropicClient.MessageParam["content"],
  ): Promise<AnthropicClient.Message> {
    const userMessage = {
      role: "user",
      content,
    } as AnthropicClient.MessageParam;

    const message = await this.client.messages.create({
      model: this.model.id,
      max_tokens: 1024,
      tools: this.getTools(),
      messages: [...this.messages, userMessage],
    });

    this.messages.push({
      role: "user",
      content,
    });

    this.messages.push({
      role: message.role,
      content: message.content,
    });

    return message;
  }

  protected convertMessages(
    messages: Message[],
  ): AnthropicClient.MessageParam[] {
    return messages.map((message) => ({
      role: message.from as "user" | "assistant",
      content: message.content,
    }));
  }

  protected async handleMessageBlocks(
    addMessage: MessageContextState["addMessage"],
    message: AnthropicClient.Messages.Message,
  ): Promise<void> {
    return await Promise.resolve().then(async () => {
      for (const content of message.content) {
        if (content.type === "text") {
          addMessage({
            content: content.text,
            from: "assistant",
          });
        } else if (content.type === "tool_use") {
          const tool = getToolInstanceByToolName(content.name);

          const toolResults = await tool.run(addMessage, content.input);

          const toolResultMessage = await this.createLLMMessage([
            {
              type: "tool_result",
              tool_use_id: content.id,
              content: toolResults,
            },
          ]);

          // recursively call itself until its finished
          this.handleMessageBlocks(addMessage, toolResultMessage);
        }
      }
    });
  }

  protected extractTokenUsage(message: AnthropicClient.Message): TokenUsage {
    return {
      inputTokens: Number(message.usage.input_tokens),
      outputTokens: Number(message.usage.output_tokens),
      cacheReadTokens: Number(message.usage.cache_read_input_tokens),
      cacheWriteTokens: Number(message.usage.cache_creation_input_tokens),
    };
  }

  // TODO: need to test this
  protected getTools(): AnthropicClient.Tool[] {
    return getAvailableTools().map((toolSchema: ToolConfigSchema) => ({
      name: toolSchema.name,
      description: toolSchema.description,
      input_schema: toolSchema.input_schema,
    }));
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
