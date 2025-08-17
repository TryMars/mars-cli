import { createContext, PropsWithChildren, useState } from "react";
import {
  CreateMessageProps,
  Message,
  MessageContextState,
} from "./message_context_types.ts";

export const MessageContext = createContext<MessageContextState>({
  messages: [],
  addMessage: (_: CreateMessageProps) => {},
});

export const MessageProvider = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const pushMessage = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const createMessage = ({
    content,
    from,
    state = "neutral",
  }: CreateMessageProps): Message => {
    return {
      id: `msg_${crypto.randomUUID()}`,
      content,
      from,
      state,
      timestamp: new Date(),
    } as Message;
  };

  const addMessage = ({
    content,
    from,
    state = "neutral",
  }: CreateMessageProps) => {
    const message = createMessage({ content, from, state });

    pushMessage(message);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage }}>
      {children}
    </MessageContext.Provider>
  );
};
