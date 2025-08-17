import { createContext, PropsWithChildren, useState } from "react";
import {
  CreateMessageType,
  MessageContextType,
} from "./message_context_types.ts";
import { MessageType } from "#components/message_list/message_list_types.ts";

export const MessageContext = createContext<MessageContextType>({
  messages: [],
  addMessage: (_: CreateMessageType) => {},
});

export const MessageProvider = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  const pushMessage = (message: MessageType) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const createMessage = ({
    content,
    from,
    state = "neutral",
  }: CreateMessageType): MessageType => {
    return {
      id: `msg_${crypto.randomUUID()}`,
      content,
      from,
      state,
      timestamp: new Date(),
    } as MessageType;
  };

  const addMessage = ({
    content,
    from,
    state = "neutral",
  }: CreateMessageType) => {
    const message = createMessage({ content, from, state });

    pushMessage(message);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
