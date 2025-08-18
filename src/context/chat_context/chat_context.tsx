import { createContext, PropsWithChildren, useEffect, useState } from "react";
import {
  ChatService,
  defaultAssistantModelId,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { ChatContextState } from "./chat_context_types.ts";
import { Model } from "#agents/agent_types.ts";
import { findModelById } from "#agents/agents.ts";

export const ChatContext = createContext<ChatContextState>({
  assistantModel: {} as Model,
  assistantProviderId: "",
});

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [chatService] = useState<ChatService>(ChatService.getInstance());
  const [assistantModel, setAssistantModel] = useState<Model>(
    findModelById({
      providerId: defaultAssistantProviderId,
      modelId: defaultAssistantModelId,
    }),
  );
  const [assistantProviderId, setAssistantProviderId] = useState<string>(
    defaultAssistantProviderId,
  );

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
