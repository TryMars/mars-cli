import { createContext, PropsWithChildren, useContext, useState } from "react";
import { InputHandlerContextState } from "./input_handler_context_types.ts";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { LLMContext } from "#context/llm_context/llm_context.tsx";
import { Message } from "#context/message_context/message_context_types.ts";

export const InputHandlerContext = createContext<InputHandlerContextState>({
  input: "",
  setInput: (_) => {},
  handleSubmit: (_) => {},
});

export const InputHandlerProvider = ({ children }: PropsWithChildren) => {
  const { addMessage } = useContext(MessageContext);
  const { handleUserMessage } = useContext(LLMContext);
  const [input, setInput] = useState<string>("");

  const handleSubmit = (from: Message["from"]) => {
    // TODO: handle slash commands

    addMessage({
      content: input,
      from,
    });

    handleUserMessage(input);

    setInput("");
  };

  return (
    <InputHandlerContext.Provider value={{ input, setInput, handleSubmit }}>
      {children}
    </InputHandlerContext.Provider>
  );
};
