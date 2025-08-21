import {
  Message,
  MessageContextState,
} from "#context/message_context/message_context_types.ts";
import { LoadingContextState } from "#context/loading_context/loading_context_types.ts";
import { LLMContextState } from "#context/llm_context/llm_context_types.ts";
import Anthropic from "@anthropic-ai/sdk";

export type Model = {
  id: string;
  name: string;
  contextWindow: number;
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

export type StreamResponseProps = {
  content: string;
  messages: Message[];
  addMessage: MessageContextState["addMessage"];
  setCurrentlyStreamedMessage: MessageContextState["setCurrentlyStreamedMessage"];
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  setIsLoading: LoadingContextState["setIsLoading"];
};

export type SetContextWindowUsageProps = {
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  tokenUsage: Anthropic.MessageDeltaUsage;
};
