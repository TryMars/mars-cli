import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { ChatService } from "#services/chat_service/chat_service.ts";
import { ChatContextState } from "./chat_context_types.ts";
import { Model } from "#llm/agents/agents_types.ts";

export const ChatContext = createContext<ChatContextState>({
  assistantModel: {} as Model,
  assistantProviderId: "",
});

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [chatService] = useState<ChatService>(ChatService.getInstance());
  const [assistantModel, setAssistantModel] = useState<Model>();
  const [assistantProviderId, setAssistantProviderId] = useState<string>();

  useEffect(() => {
    const initializeChatService = async () => {
      await chatService.initialize();

      const config = await chatService.loadConfig();

      setAssistantModel(config.currentModel);
      setAssistantProviderId(config.currentProviderId);
    };

    initializeChatService();
  }, [chatService]);

  return (
    <ChatContext.Provider value={{ assistantModel, assistantProviderId }}>
      {children}
    </ChatContext.Provider>
  );
};
