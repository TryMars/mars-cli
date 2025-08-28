import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { LLMContextState } from "./llm_context_types.ts";
import { LoadingContext } from "#context/loading_context/loading_context.tsx";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { ChatContext } from "#context/chat_context/chat_context.tsx";
import { AgentInterface } from "#llm/agents/agent_interface.ts";
import { getAgentInstanceByProviderId } from "#llm/llm.ts";

export const LLMContext = createContext<LLMContextState>({
  handleUserMessage: (_) => {},
  setContextWindowUsage: (_) => {},
  contextWindowUsage: 0,
  setUsageCost: (_) => {},
  usageCost: 0,
});

export const LLMProvider = ({ children }: PropsWithChildren) => {
  const { setIsLoading } = useContext(LoadingContext);
  const { addMessage } = useContext(MessageContext);
  const { assistantModel, assistantProviderId } = useContext(ChatContext);
  const [agent, setAgent] = useState<AgentInterface>();
  const [contextWindowUsage, setContextWindowUsage] = useState<number>(0);
  const [usageCost, setUsageCost] = useState<number>(0);

  useEffect(() => {
    if (assistantProviderId && assistantModel) {
      setAgent(
        getAgentInstanceByProviderId({
          providerId: assistantProviderId,
          modelId: assistantModel.id,
        }),
      );
    }
  }, [assistantModel, assistantProviderId]);

  const handleUserMessage = async (content: string) => {
    setIsLoading(true);

    await agent?.createResponse({
      content,
      addMessage,
      setContextWindowUsage,
      setUsageCost,
      setIsLoading,
    });
  };

  return (
    <LLMContext.Provider
      value={{
        handleUserMessage,
        contextWindowUsage,
        setContextWindowUsage,
        usageCost,
        setUsageCost,
      }}
    >
      {children}
    </LLMContext.Provider>
  );
};
