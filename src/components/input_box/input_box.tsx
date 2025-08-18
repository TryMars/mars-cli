import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useContext } from "react";
import { InputHandlerContext } from "#context/input_handler_context/input_handler_context.tsx";
import { ChatContext } from "#context/chat_context/chat_context.tsx";

export const inputBoxPlaceholderText: string =
  "Type your request or use /help for commands";

export const InputBox = () => {
  const { assistantModel } = useContext(ChatContext);
  const { input, setInput, handleSubmit } = useContext(InputHandlerContext);

  return (
    <>
      <Box marginTop={1} flexDirection="row" justifyContent="space-between">
        <Text dimColor color="dim">
          {assistantModel.name}
        </Text>
        <Text color="magenta">{Deno.cwd()}</Text>
      </Box>

      <Box borderStyle="round" borderDimColor>
        <Text>
          <Text dimColor>{" > "}</Text>
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={() => handleSubmit("user")}
            placeholder={inputBoxPlaceholderText}
            showCursor
          />
        </Text>
      </Box>
    </>
  );
};
