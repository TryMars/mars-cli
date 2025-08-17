import { createContext, PropsWithChildren, useContext } from "react";
import { LLMContextType } from "./llm_context_types.ts";
import { LoadingContext } from "#context/loading_context/loading_context.tsx";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { envInTestMode } from "#shared/utils/utils.ts";

export const LLMContext = createContext<LLMContextType>({
  handleUserMessage: (_: string) => {},
});

export const llmMockResponse = "LLM integration coming soon...";

export const LLMProvider = ({ children }: PropsWithChildren) => {
  const { setIsLoading } = useContext(LoadingContext);
  const { addMessage } = useContext(MessageContext);

  const handleUserMessage = (_content: string) => {
    setIsLoading(true);

    if (envInTestMode()) {
      setTimeout(() => {
        addMessage({
          content: llmMockResponse,
          from: "assistant",
        });

        setIsLoading(false);
      }, 1);
    }
  };

  return (
    <LLMContext.Provider value={{ handleUserMessage }}>
      {children}
    </LLMContext.Provider>
  );
};
