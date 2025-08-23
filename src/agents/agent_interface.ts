import { Model } from "./agent_types.ts";
import { CreateResponseProps } from "./providers/anthropic/anthropic_types.ts";

export interface AgentInterface {
  model: Model;

  createResponse({
    content,
    addMessage,
    setContextWindowUsage,
    setUsageCost,
    setIsLoading,
  }: CreateResponseProps): Promise<void>;

  // @ts-ignore: idk what return type to use here. maybe im dumb.
  createLLMMessage(content: string, messages: Message[]);
}
