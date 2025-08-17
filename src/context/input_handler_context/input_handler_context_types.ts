import { Message } from "#context/message_context/message_context_types.ts";

export type InputHandlerContextState = {
  input: string;
  setInput: (_: string) => void;
  handleSubmit: (_: Message["from"]) => void;
};
