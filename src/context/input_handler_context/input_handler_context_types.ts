import { MessageType } from "#components/message_list/message_list_types.ts";

export type InputHandlerContextType = {
  input: string;
  setInput: (_: string) => void;
  handleSubmit: (_: MessageType["from"]) => void;
};
