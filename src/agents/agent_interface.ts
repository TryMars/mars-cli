import { StreamResponseProps } from "./agent_types.ts";

export interface AgentInterface {
  streamResponse({
    content,
    addMessage,
    setCurrentlyStreamedMessage,
    setIsLoading,
  }: StreamResponseProps): Promise<void>;

  // @ts-ignore: idk what return type to use here. maybe im dumb.
  getStreamedEvents(content: string);
}
