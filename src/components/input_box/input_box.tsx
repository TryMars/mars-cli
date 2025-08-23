import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useContext } from "react";
import { InputHandlerContext } from "#context/input_handler_context/input_handler_context.tsx";
import { ChatContext } from "#context/chat_context/chat_context.tsx";
import { inputBoxMessages } from "./input_box_messages.ts";
import { LLMContext } from "#context/llm_context/llm_context.tsx";
import { formatCentsForDisplay } from "#shared/utils/utils.ts";

export const InputBox = () => {
  const { assistantModel } = useContext(ChatContext);
  const { input, setInput, handleSubmit } = useContext(InputHandlerContext);
  const { contextWindowUsage, usageCost } = useContext(LLMContext);

  return (
    <>
      <Box marginTop={1} flexDirection="row">
        <Box flexDirection="row" gap={1}>
          <Text dimColor>{assistantModel?.name ?? "..."}</Text>

          <Text>|</Text>

          <Text color="blue">Context Window: {contextWindowUsage}%</Text>

          <Text>|</Text>

          <Text color="green">Spent: {formatCentsForDisplay(usageCost)}</Text>
        </Box>
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
