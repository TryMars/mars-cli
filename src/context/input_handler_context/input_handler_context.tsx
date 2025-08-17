import { createContext, PropsWithChildren, useContext, useState } from "react";
import { InputHandlerContextType } from "./input_handler_context_types.ts";
import { MessageContext } from "../message_context/message_context.tsx";
import { MessageType } from "#components/message_list/message_list_types.ts";
import { LLMContext } from "../llm_context/llm_context.tsx";

export const InputHandlerContext = createContext<InputHandlerContextType>({
  input: "",
  setInput: (_: string) => {},
  handleSubmit: (_: MessageType["from"]) => {},
});

export const InputHandlerProvider = ({ children }: PropsWithChildren) => {
  const { addMessage } = useContext(MessageContext);
  const { handleUserMessage } = useContext(LLMContext);
  const [input, setInput] = useState<string>("");

  const handleSubmit = (from: MessageType["from"]) => {
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
