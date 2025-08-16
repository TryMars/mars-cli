export type MessageType = {
  id: string;
  from: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  state: "success" | "warning" | "error" | "neutral";
};
