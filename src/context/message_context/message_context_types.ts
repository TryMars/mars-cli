export type MessageContextState = {
  messages: Message[];
  addMessage: (_: CreateMessageProps) => void;
};

export type CreateMessageProps = {
  content: string;
  from: Message["from"];
  state?: Message["state"];
};

export type Message = {
  id: string;
  from: "user" | "assistant" | "system" | "tool_call" | "tool_call_error";
  content: string;
  timestamp: Date;
  state: "success" | "warning" | "error" | "neutral";
};
