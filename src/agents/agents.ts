import {
  FindModelByIdProps,
  Model,
  ProviderWithModels,
} from "./agent_types.ts";
import { Anthropic } from "./providers/anthropic.ts";

export const getAvailableModels = (): ProviderWithModels[] => {
  return [new Anthropic().getProviderWithModels()];
};

export const findModelById = ({
  providerId,
  modelId,
}: FindModelByIdProps): Model => {
  const provider = getAvailableModels().find(
    (provider) => provider.id === providerId,
  );

  if (provider === undefined) {
    throw new Error(
      `The provider you are searching for cannot be found: ${providerId}`,
    );
  }

  const model = provider.models.find((model) => model.id === modelId);

  if (model === undefined) {
    throw new Error(
      `The model you are searching for cannot be found: ${modelId}`,
    );
  }

  return model;
};
