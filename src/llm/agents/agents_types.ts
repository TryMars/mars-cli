import { Message } from "#context/message_context/message_context_types.ts";
import { MessageContextState } from "#context/message_context/message_context_types.ts";
import { LoadingContextState } from "#context/loading_context/loading_context_types.ts";
import { LLMContextState } from "#context/llm_context/llm_context_types.ts";
import { AgentInterface } from "./agent_interface.ts";

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

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
};

export type CreateResponseProps = {
  content: string;
  messages: Message[];
  addMessage: MessageContextState["addMessage"];
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  setUsageCost: LLMContextState["setUsageCost"];
  setIsLoading: LoadingContextState["setIsLoading"];
};

export type AgentConfig = ProviderWithModels & {
  getInstance: (modelId: string) => AgentInterface;
};

export type HandleUsageProps = {
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  setUsageCost: LLMContextState["setUsageCost"];
  tokenUsage: TokenUsage;
};
