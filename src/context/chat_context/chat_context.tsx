import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { ChatService } from "#services/chat_service/chat_service.ts";
import { ChatContextState } from "./chat_context_types.ts";
import { envInTestMode } from "#shared/utils/utils.ts";

export const ChatContext = createContext<ChatContextState>({});

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [chatService] = useState<ChatService>(new ChatService());

  useEffect(() => {
    const initializeChatService = async () => {
      await chatService.initialize();
    };

    if (!envInTestMode()) {
      initializeChatService();
    }
  }, [chatService]);

  return <ChatContext.Provider value={{}}>{children}</ChatContext.Provider>;
};
