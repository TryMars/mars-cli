import { CreateResponseProps, Model } from "#llm/agents/agents_types.ts";

export interface AgentInterface {
  model: Model;

  createResponse(props: CreateResponseProps): Promise<void>;

  createLLMMessage(content: string): Promise<unknown>;
}
