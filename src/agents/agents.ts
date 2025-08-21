import { AgentInterface } from "./agent_interface.ts";
import {
  Model,
  ProviderIdAndModelIdProps,
  ProviderWithModels,
} from "./agent_types.ts";
import { agentsMessages } from "./agents_messages.ts";
import { Anthropic } from "./providers/anthropic/anthropic.ts";

export const getAvailableModels = (): ProviderWithModels[] => {
  return [Anthropic.getProviderWithModels()];
};

export const findModelById = ({
  providerId,
  modelId,
}: ProviderIdAndModelIdProps): Model => {
  const provider = getAvailableModels().find(
    (provider) => provider.id === providerId,
  );

  if (provider === undefined) {
    throw new TypeError(agentsMessages.error.provider_not_found(providerId));
  }

  const model = provider.models.find((model) => model.id === modelId);

  if (model === undefined) {
    throw new TypeError(agentsMessages.error.model_not_found(modelId));
  }

  return model;
};

export const getAgentInstanceByProviderId = ({
  providerId,
  modelId,
}: ProviderIdAndModelIdProps): AgentInterface => {
  switch (providerId) {
    case "anthropic":
      return Anthropic.getInstance(modelId);
    default:
      throw new TypeError(agentsMessages.error.provider_not_found(providerId));
  }
};
