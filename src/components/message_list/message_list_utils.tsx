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

  if (from === "tool_call") {
    return <Text color="green">⏺</Text>;
  }

  if (from === "tool_call_error") {
    return <Text color="red">⏺</Text>;
  }

  if (from === "assistant") {
    return <Text color="white">⏺</Text>;
  }

  return "";
};

export const formatMessageContent = (message: Message) => {
  if (message.from !== "assistant") {
    return [message.content];
  }

  const content = stripMarkdownSyntax(message.content);
  return formatInlineCodeInMessageContent(content);
};

export const stripMarkdownSyntax = (content: string) => {
  return content
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1");
};

const formatInlineCodeInMessageContent = (content: string) => {
  // TODO: use highlight.js to highlight this??
  const codeBlockParts = content.split(/(```[\s\S]*?```)/g);

  return codeBlockParts
    .map((blockPart, blockIndex) => {
      if (blockPart.startsWith("```") && blockPart.endsWith("```")) {
        return blockPart;
      }

      const parts = blockPart.split(/(`[^`]+`)/g);

      return parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          const codeContent = part.slice(1, -1); // remove the single backticks
          return (
            <Text key={`${blockIndex}-${i}`} color="magenta">
              {codeContent}
            </Text>
          );
        }
        return part;
      });
    })
    .flat();
};
