import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useContext, useState } from "react";
import { MessageContext } from "#context/message_context/message_context.tsx";

export const inputBoxPlaceholderText: string =
  "Type your request or use /help for commands";

export const InputBox = () => {
  const { addMessage } = useContext(MessageContext);
  const [input, setInput] = useState<string>("");

  /**
   * Processes user input submission by creating a new message from the current
   * input value and adding it to the message list. After submission, clears
   * the input field to prepare for the next user input.
   */
  const handleSubmit = () => {
    addMessage({
      content: input,
      from: "user",
    });

    setInput("");
  };

  return (
    <>
      <Box flexDirection="row" justifyContent="space-between">
        <Text dimColor color="dim">
          claude-4-sonnett
        </Text>
        <Text color="magenta">{Deno.cwd()}</Text>
      </Box>

      <Box borderStyle="round" borderDimColor>
        <Text>
          <Text dimColor>{" > "}</Text>
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder={inputBoxPlaceholderText}
            showCursor
          />
        </Text>
      </Box>
    </>
  );
};
