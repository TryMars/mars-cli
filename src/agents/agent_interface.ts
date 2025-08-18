import { ProviderWithModels } from "./agent_types.ts";

export interface AgentInterface {
  getProviderWithModels(): ProviderWithModels;
}
