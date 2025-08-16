import { useContext } from "react";
import { MessageContext } from "#context/message_context/message_context.tsx";
import { Box, Text } from "ink";
import { MessageType } from "./message_list_types.ts";
import {
  getMessageColor,
  getMessagePrefix,
} from "#components/message_list/message_list_utils.tsx";

export const MessageList = () => {
  const { messages } = useContext(MessageContext);

  return (
    <Box marginTop={messages.length > 0 ? 1 : 0} flexDirection="column" gap={1}>
      {messages.map((message: MessageType) => (
        <Box flexDirection="row" gap={1} key={message.id}>
          {message.from !== "system" && (
            <Box flexShrink={1}>{getMessagePrefix(message.from)}</Box>
          )}
          <Box>
            <Text
              dimColor={message.from === "user"}
              color={getMessageColor(message.state)}
            >
              {message.content}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
