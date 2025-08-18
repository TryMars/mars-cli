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
});

export const ChatProvider = ({ children }: PropsWithChildren) => {
  const [chatService] = useState<ChatService>(ChatService.getInstance());
  const [assistantModel, setAssistantModel] = useState<Model>(
    findModelById({
      providerId: defaultAssistantProviderId,
      modelId: defaultAssistantModelId,
    }),
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
