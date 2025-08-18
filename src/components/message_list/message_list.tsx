import { useContext } from "react";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { Box, Text } from "ink";
import {
  getMessageColor,
  getMessagePrefix,
} from "#components/message_list/message_list_utils.tsx";
import { Message } from "#context/message_context/message_context_types.ts";

export const MessageList = () => {
  const { messages, currentlyStreamedMessage } = useContext(MessageContext);

  return (
    <Box marginTop={messages.length > 0 ? 1 : 0} flexDirection="column" gap={1}>
      {messages.map((message: Message) => (
        <Box flexDirection="row" key={message.id}>
          {message.from !== "system" && (
            <Box flexShrink={1}>{getMessagePrefix(message.from)}</Box>
          )}
          <Box marginLeft={message.from === "assistant" ? 0 : 1}>
            <Text
              dimColor={message.from === "user"}
              color={getMessageColor(message.state)}
            >
              {message.content}
            </Text>
          </Box>
        </Box>
      ))}

      {currentlyStreamedMessage && (
        <Box flexDirection="row" key="temp-streamed-message">
          <Box flexShrink={1}>{getMessagePrefix("assistant")}</Box>
          <Box>
            <Text>{currentlyStreamedMessage}</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};
