import { AgentInterface } from "#llm/agents/agent_interface.ts";
import {
  AgentConfig,
  Model,
  ProviderWithModels,
} from "#llm/agents/agents_types.ts";
import { llmMessages } from "#llm/llm_messages.ts";

export class AgentRegistry {
  private static agents = new Map<string, AgentConfig>();

  static register(agent: AgentConfig): void {
    this.agents.set(agent.id, agent);
  }

  static getInstance(providerId: string, modelId: string): AgentInterface {
    const agent = this.agents.get(providerId);

    if (!agent) {
      throw new TypeError(llmMessages.error.provider_not_found(providerId));
    }

    const model = agent.models.find((model: Model) => model.id === modelId);

    if (!model) {
      throw new TypeError(llmMessages.error.model_not_found(modelId));
    }

    return agent.getInstance(modelId);
  }

  static getAvailableProvidersWithModels(): ProviderWithModels[] {
    return Array.from(this.agents.values()).map(
      (provider) =>
        ({
          id: provider.id,
          name: provider.name,
          models: provider.models,
        }) as ProviderWithModels,
    );
  }

  static getAgent(providerId: string): AgentConfig | undefined {
    return this.agents.get(providerId);
  }

  static getAllProviderIds(): string[] {
    return Array.from(this.agents.keys());
  }
}

