import { AgentInterface } from "#llm/agents/agent_interface.ts";
import {
  Model,
  CreateResponseProps,
  TokenUsage,
  HandleUsageProps,
} from "#llm/agents/agents_types.ts";
import {
  Message,
  MessageContextState,
} from "#context/message_context/message_context_types.ts";
import { LLMContextState } from "#context/llm_context/llm_context_types.ts";

export abstract class BaseAgent<
  TClient = object,
  TMessage = object,
  TMessageParam = object,
  TMessageParamContent = object[],
  TTool = object,
> implements AgentInterface
{
  public model: Model;
  protected abstract client: TClient;
  protected abstract messages: TMessageParam[];

  constructor(model: Model) {
    this.model = model;
  }

  abstract createLLMMessage(content: string): Promise<TMessage>;

  protected abstract extractTokenUsage(message: TMessage): TokenUsage;

  protected abstract convertMessages(messages: Message[]): TMessageParam[];

  protected abstract getTools(): TTool[];

  protected abstract handleMessageContent(
    content: string | TMessageParamContent,
    addMessage: MessageContextState["addMessage"],
    setContextWindowUsage: LLMContextState["setContextWindowUsage"],
    setUsageCost: LLMContextState["setUsageCost"],
  ): Promise<void>;

  async createResponse({
    content,
    addMessage,
    setContextWindowUsage,
    setUsageCost,
    setIsLoading,
  }: CreateResponseProps): Promise<void> {
    await this.handleMessageContent(
      content,
      addMessage,
      setContextWindowUsage,
      setUsageCost,
    );

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
