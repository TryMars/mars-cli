export type Model = {
  id: string;
  name: string;
  contextWindow: number;
  pricing: ModelPricing;
};

export type ModelPricing = {
  input_cost: number;
  output_cost: number;
  cache_read_cost: number;
  cache_write_cost: number;
};

export type Provider = {
  id: string;
  name: string;
};

export type ProviderWithModels = Provider & {
  models: Model[];
};

export type ProviderIdAndModelIdProps = {
  providerId: string;
  modelId: string;
};
