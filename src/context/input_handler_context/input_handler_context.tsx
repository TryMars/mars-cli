import { createContext, PropsWithChildren, useContext, useState } from "react";
import { InputHandlerContextType } from "./input_handler_context_types.ts";
import { MessageContext } from "../message_context/message_context.tsx";
import { MessageType } from "#components/message_list/message_list_types.ts";

export const InputHandlerContext = createContext<InputHandlerContextType>({
  input: "",
  setInput: (_: string) => {},
  handleSubmit: (_: MessageType["from"]) => {},
});

export const InputHandlerProvider = ({ children }: PropsWithChildren) => {
  const { addMessage } = useContext(MessageContext);
  const [input, setInput] = useState<string>("");

  /**
   * Processes user input submission by creating a new message from the current
   * input value and adding it to the message list. After submission, clears
   * the input field to prepare for the next user input.
   */
  const handleSubmit = (from: MessageType["from"]) => {
    // TODO: handle slash commands

    addMessage({
      content: input,
      from,
    });

    setInput("");
  };

  return (
    <InputHandlerContext.Provider value={{ input, setInput, handleSubmit }}>
      {children}
    </InputHandlerContext.Provider>
  );
};
