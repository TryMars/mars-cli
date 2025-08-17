import { ReactElement } from "react";
import { Text } from "ink";
import { Message } from "#context/message_context/message_context_types.ts";

export const getMessageColor = (state: Message["state"]): string => {
  if (state === "success") return "green";
  if (state === "warning") return "yellow";
  if (state === "error") return "red";

  return "";
};

export const getMessagePrefix = (
  from: Message["from"],
): string | ReactElement<Text> => {
  if (from === "user") {
    return <Text dimColor>{">"}</Text>;
  }

  if (from === "assistant") {
    return <Text color="red">⏺</Text>;
  }

  return "";
};
