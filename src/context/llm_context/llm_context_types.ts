export type LLMContextState = {
  handleUserMessage: (_: string) => void;
  setContextWindowUsage: (_: number) => void;
  contextWindowUsage: number;
  setUsageCost: (_: number) => void;
  usageCost: number;
};
