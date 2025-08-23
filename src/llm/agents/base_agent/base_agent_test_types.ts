import { AgentInterface } from "#llm/agents/agent_interface.ts";

export type BaseAgentTestConfig = {
  agent: AgentInterface;
  mockLLMResponse: object;
  expectedContent: string;
  expectedContextWindowUsage: number;
  expectedUsageCost: number;
};
