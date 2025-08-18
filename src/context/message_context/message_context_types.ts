export type MessageContextState = {
  messages: Message[];
  addMessage: (_: CreateMessageProps) => void;
  currentlyStreamedMessage: string;
  setCurrentlyStreamedMessage: (content: string) => void;
};

export type CreateMessageProps = {
  content: string;
  from: Message["from"];
  state?: Message["state"];
};

export type Message = {
  id: string;
  from: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  state: "success" | "warning" | "error" | "neutral";
};
