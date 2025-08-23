import {
  Message,
  MessageContextState,
} from "#context/message_context/message_context_types.ts";
import { LoadingContextState } from "#context/loading_context/loading_context_types.ts";
import { LLMContextState } from "#context/llm_context/llm_context_types.ts";
import Anthropic from "@anthropic-ai/sdk";

export type CreateResponseProps = {
  content: string;
  messages: Message[];
  addMessage: MessageContextState["addMessage"];
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  setUsageCost: LLMContextState["setUsageCost"];
  setIsLoading: LoadingContextState["setIsLoading"];
};

export type HandleContextWindowUsageProps = {
  setContextWindowUsage: LLMContextState["setContextWindowUsage"];
  tokenUsage: Anthropic.Usage;
};

export type HandleCostUsageProps = {
  setUsageCost: LLMContextState["setUsageCost"];
  tokenUsage: Anthropic.Usage;
};

export type ExtractedTokenUsage = {
  inputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  outputTokens: number;
};
