import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useContext } from "react";
import { InputHandlerContext } from "#context/input_handler_context/input_handler_context.tsx";
import { ChatContext } from "#context/chat_context/chat_context.tsx";
import { inputBoxMessages } from "./input_box_messages.ts";

export const InputBox = () => {
  const { assistantModel } = useContext(ChatContext);
  const { input, setInput, handleSubmit } = useContext(InputHandlerContext);

  return (
    <>
      <Box marginTop={1} flexDirection="row" justifyContent="space-between">
        <Text dimColor color="dim">
          {assistantModel?.name ?? "..."}
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
            placeholder={inputBoxMessages.input.placeholder()}
            showCursor
          />
        </Text>
      </Box>
    </>
  );
};
