import { CreateResponseProps, Model } from "#llm/agents/agents_types.ts";
import { Message } from "#context/message_context/message_context_types.ts";

export interface AgentInterface {
  model: Model;

  createResponse(props: CreateResponseProps): Promise<void>;
  createLLMMessage(content: string, messages: Message[]): Promise<unknown>;
}
