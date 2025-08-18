export type Model = {
  id: string;
  name: string;
};

export type ProviderWithModels = {
  id: string;
  name: string;
  models: Model[];
};
