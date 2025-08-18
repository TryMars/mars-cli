import { AgentInterface } from "./agent_interface.ts";
import {
  Model,
  ProviderIdAndModelIdProps,
  ProviderWithModels,
} from "./agent_types.ts";
import { Anthropic } from "./providers/anthropic.ts";

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
    throw new TypeError(
      `The provider you are searching for cannot be found: ${providerId}`,
    );
  }

  const model = provider.models.find((model) => model.id === modelId);

  if (model === undefined) {
    throw new TypeError(
      `The model you are searching for cannot be found: ${modelId}`,
    );
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
      throw new TypeError(
        `The provider you are searching for cannot be found: ${providerId}`,
      );
  }
};
