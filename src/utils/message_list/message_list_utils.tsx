import { ReactElement } from "react";
import { MessageType } from "#components/message_list/message_list_types.ts";
import { Text } from "ink";

/**
 * Determines the text color based on the message state
 */
export const getMessageColor = (state: MessageType["state"]): string => {
  if (state === "success") return "green";
  if (state === "warning") return "yellow";
  if (state === "error") return "red";

  return "";
};

/**
 * Returns the prefix element to display before each
 * message based on sender
 */
export const getMessagePrefix = (
  from: MessageType["from"],
): string | ReactElement<Text> => {
  if (from === "user") {
    return <Text dimColor>{">"}</Text>;
  }

  if (from === "assistant") {
    return <Text color="red">⏺</Text>;
  }

  return "";
};
