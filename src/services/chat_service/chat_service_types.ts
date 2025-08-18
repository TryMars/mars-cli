import { Model } from "#agents/agent_types.ts";

export type Config = {
  currentProviderId: string;
  currentModel: Model;
  defaultProviderId: string;
  defaultModel: Model;
  lastUsedChat: string | null;
};
