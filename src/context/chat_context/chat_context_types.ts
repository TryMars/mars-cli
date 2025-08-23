import { Model } from "#llm/agents/agents_types.ts";

export type ChatContextState = {
  assistantModel: Model | undefined;
  assistantProviderId: string | undefined;
};
