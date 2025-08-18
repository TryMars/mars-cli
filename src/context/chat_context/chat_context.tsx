import { createContext, PropsWithChildren, useEffect, useState } from "react";
import {
  ChatService,
  defaultAssistantModel,
} from "#services/chat_service/chat_service.ts";
import { ChatContextState } from "./chat_context_types.ts";

export const ChatContext = createContext<ChatContextState>({
  assistantModel: "",
});

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [chatService] = useState<ChatService>(new ChatService());
  const [assistantModel, setAssistantModel] = useState<string>(
    defaultAssistantModel,
  );

  useEffect(() => {
    const initializeChatService = async () => {
      await chatService.initialize();

      setAssistantModel((await chatService.loadConfig()).currentModel);
    };

    initializeChatService();
  }, [chatService]);

  return (
    <ChatContext.Provider value={{ assistantModel }}>
      {children}
    </ChatContext.Provider>
  );
};
