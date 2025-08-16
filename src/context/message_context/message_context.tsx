import { createContext, ReactNode, useState } from "react";
import {
  CreateMessageType,
  MessageContextType,
} from "#context/message_context/message_context_types.ts";
import { MessageType } from "#components/message_list/message_list_types.ts";

export const MessageContext = createContext<MessageContextType>({
  messages: [],
  addMessage: (_: CreateMessageType) => {},
});

export const MessageProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);

  /**
   * Pushes a new message to the message list using a functional update
   * to prevent race conditions
   */
  const pushMessage = (message: MessageType) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  /**
   * Creates a new message with a unique ID and automatically
   * generated timestamp
   */
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

  /**
   * Public facing method that creates the message object
   * properly, and then pushes it to the message list
   */
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
