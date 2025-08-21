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
import { AgentInterface } from "#agents/agent_interface.ts";
import { ChatContext } from "#context/chat_context/chat_context.tsx";
import { getAgentInstanceByProviderId } from "#agents/agents.ts";

export const LLMContext = createContext<LLMContextState>({
  handleUserMessage: (_) => {},
});

export const LLMProvider = ({ children }: PropsWithChildren) => {
  const { setIsLoading } = useContext(LoadingContext);
  const { messages, addMessage, setCurrentlyStreamedMessage } =
    useContext(MessageContext);
  const { assistantModel, assistantProviderId } = useContext(ChatContext);
  const [agent, setAgent] = useState<AgentInterface>();

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

    await agent?.streamResponse({
      content,
      messages,
      addMessage,
      setCurrentlyStreamedMessage,
      setIsLoading,
    });
  };

  return (
    <LLMContext.Provider value={{ handleUserMessage }}>
      {children}
    </LLMContext.Provider>
  );
};
