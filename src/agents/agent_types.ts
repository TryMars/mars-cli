import {
  Message,
  MessageContextState,
} from "#context/message_context/message_context_types.ts";
import { LoadingContextState } from "#context/loading_context/loading_context_types.ts";

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

export type ProviderIdAndModelIdProps = {
  providerId: string;
  modelId: string;
};

export type StreamResponseProps = {
  content: string;
  messages: Message[];
  addMessage: MessageContextState["addMessage"];
  setCurrentlyStreamedMessage: MessageContextState["setCurrentlyStreamedMessage"];
  setIsLoading: LoadingContextState["setIsLoading"];
};
