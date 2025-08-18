export type Model = {
  id: string;
  name: string;
};

export type Provider = {
  id: string;
  name: string;
};

export type ProviderWithModels = Provider & {
  models: Model[];
};

export type FindModelByIdProps = {
  providerId: string;
  modelId: string;
};
