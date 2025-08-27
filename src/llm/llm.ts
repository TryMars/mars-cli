import { agents } from "./agents/agents.ts";
import {
  Model,
  ProviderIdAndModelIdProps,
  ProviderWithModels,
} from "./agents/agents_types.ts";
import { AgentRegistry } from "./registries/agent_registry/agent_registry.ts";
import { llmMessages } from "./llm_messages.ts";
import { AgentInterface } from "./agents/agent_interface.ts";
import { tools } from "./tools/tools.ts";
import { ToolRegistry } from "./registries/tool_registry/tool_registry.ts";
import { ToolConfigSchema } from "./tools/tools_types.ts";

for (const tool of tools) {
  ToolRegistry.register(tool);
}

for (const agent of agents) {
  AgentRegistry.register(agent);
}

export const getAvailableModels = (): ProviderWithModels[] => {
  return AgentRegistry.getAvailableProvidersWithModels();
};

export const findModelById = ({
  providerId,
  modelId,
}: ProviderIdAndModelIdProps): Model => {
  const agent = AgentRegistry.getAgent(providerId);

  if (agent === undefined) {
    throw new TypeError(llmMessages.error.provider_not_found(providerId));
  }

  const model = agent.models.find((model: Model) => model.id === modelId);

  if (model === undefined) {
    throw new TypeError(llmMessages.error.model_not_found(modelId));
  }

  return model;
};

export const getAgentInstanceByProviderId = ({
  providerId,
  modelId,
}: ProviderIdAndModelIdProps): AgentInterface => {
  return AgentRegistry.getInstance(providerId, modelId);
};

export const getAvailableTools = (): ToolConfigSchema[] => {
  return ToolRegistry.getTools();
};
