import { Model } from "#agents/agent_types.ts";

export type ChatContextState = {
  assistantModel: Model | undefined;
  assistantProviderId: string | undefined;
};
