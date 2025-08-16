import { MessageType } from "#components/message_list/message_list_types.ts";

export type MessageContextType = {
  messages: MessageType[];
  addMessage: (_: CreateMessageType) => void;
};

export type CreateMessageType = {
  content: string;
  from: MessageType["from"];
  state?: MessageType["state"];
};
