import { Box, Text } from "ink";

const Logo = () => {
  return (
    <Box flexDirection="column" gap={0} marginY={1} paddingX={1}>
      <Box marginBottom={1} flexDirection="column">
        <Text>🌙 moonlight.</Text>

        <Text dimColor>Your lightweight and affordable AI coding agent</Text>
      </Box>

      <Box flexDirection="column">
        <Text dimColor>Use moonlight to:</Text>
        <Box marginLeft={2} flexDirection="column">
          <Text dimColor>* Search and analyze files and directories</Text>
          <Text dimColor>
            * Implement file updates in the style of Claude Code
          </Text>
          <Text dimColor>* Switch LLM models on the fly using /model</Text>
          <Text dimColor>* Jump in and out of different chats using /chat</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Logo;
