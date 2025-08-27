import { AgentInterface } from "#llm/agents/agent_interface.ts";
import {
  Model,
  CreateResponseProps,
  TokenUsage,
  HandleUsageProps,
} from "#llm/agents/agents_types.ts";
import { Message } from "#context/message_context/message_context_types.ts";

export abstract class BaseAgent<
  TMessage = object,
  TMessageParam = object,
  TTool = object,
> implements AgentInterface
{
  public model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  abstract createLLMMessage(
    content: string,
    messages: Message[],
  ): Promise<TMessage>;

  protected abstract extractLLMMessageContent(message: TMessage): string;

  protected abstract extractTokenUsage(message: TMessage): TokenUsage;

  protected abstract convertMessages(messages: Message[]): TMessageParam[];

  // TODO: need to test this
  protected abstract getTools(): TTool[];

  async createResponse({
    content,
    messages,
    addMessage,
    setContextWindowUsage,
    setUsageCost,
    setIsLoading,
  }: CreateResponseProps): Promise<void> {
    const message = await this.createLLMMessage(content, messages);
    const messageContent = this.extractLLMMessageContent(message);
    const tokenUsage = this.extractTokenUsage(message);

    addMessage({
      content: messageContent,
      from: "assistant",
    });

    this.handleUsage({
      setContextWindowUsage,
      setUsageCost,
      tokenUsage,
    });

    setIsLoading(false);
  }

  protected handleUsage({
    setContextWindowUsage,
    setUsageCost,
    tokenUsage,
  }: HandleUsageProps): void {
    const contextWindowUsage = this.calculateContextWindowUsage(tokenUsage);

    setContextWindowUsage(
      this.calculateContextWindowPercentage(contextWindowUsage),
    );

    setUsageCost(this.calculateCost(tokenUsage));
  }

  protected calculateContextWindowUsage(tokenUsage: TokenUsage): number {
    return (
      tokenUsage.inputTokens +
      tokenUsage.outputTokens +
      (tokenUsage.cacheReadTokens ?? 0) +
      (tokenUsage.cacheWriteTokens ?? 0)
    );
  }

  protected calculateContextWindowPercentage(
    contextWindowUsage: number,
  ): number {
    return (
      Math.round((contextWindowUsage / this.model.contextWindow) * 100 * 10) /
      10
    );
  }

  protected calculateCost(tokenUsage: TokenUsage): number {
    const pricing = this.model.pricing;

    return (
      (tokenUsage.inputTokens * pricing.input_cost) / 1_000_000 +
      ((tokenUsage.cacheReadTokens ?? 0) *
        (pricing.cache_read_cost ?? pricing.input_cost)) /
        1_000_000 +
      ((tokenUsage.cacheWriteTokens ?? 0) *
        (pricing.cache_write_cost ?? pricing.input_cost)) /
        1_000_000 +
      (tokenUsage.outputTokens * pricing.output_cost) / 1_000_000
    );
  }
}
