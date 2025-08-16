import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";

export const inputBoxPlaceholderText: string =
  "Type your request or use /help for commands";

export const InputBox = () => {
  const [input, setInput] = useState<string>("");

  const handleSubmit = () => {
    console.log(input);
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
          <Text dimColor>{"> "}</Text>
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
