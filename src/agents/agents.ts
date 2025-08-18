import { ProviderWithModels } from "./agent_types.ts";
import { Anthropic } from "./providers/anthropic.ts";

export const getAvailableModels = (): ProviderWithModels[] => {
  return [new Anthropic().getProviderWithModels()];
};
