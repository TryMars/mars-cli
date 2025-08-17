import { ReactElement } from "react";
import { MessageType } from "./message_list_types.ts";
import { Text } from "ink";

export const getMessageColor = (state: MessageType["state"]): string => {
  if (state === "success") return "green";
  if (state === "warning") return "yellow";
  if (state === "error") return "red";

  return "";
};

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
