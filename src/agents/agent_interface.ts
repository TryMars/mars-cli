import { Model, StreamResponseProps } from "./agent_types.ts";

export interface AgentInterface {
  model: Model;

  streamResponse({
    content,
    addMessage,
    setCurrentlyStreamedMessage,
    setContextWindowUsage,
    setUsageCost,
    setIsLoading,
  }: StreamResponseProps): Promise<void>;

  // @ts-ignore: idk what return type to use here. maybe im dumb.
  getStreamedEvents(content: string);
}
