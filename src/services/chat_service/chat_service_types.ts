import { Model } from "#llm/agents/agents_types.ts";

export type Config = {
  currentProviderId: string;
  currentModel: Model;
  defaultProviderId: string;
  defaultModel: Model;
  lastUsedChat: string | null;
};
