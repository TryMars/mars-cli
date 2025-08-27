import { describe, it, beforeEach } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { AgentRegistry } from "./agent_registry.ts";
import { AgentConfig, Model } from "#llm/agents/agents_types.ts";
import { AgentInterface } from "#llm/agents/agent_interface.ts";
import { llmMessages } from "#llm/llm_messages.ts";

class MockAgent implements AgentInterface {
  constructor(public model: Model) {}

  async createResponse(): Promise<void> {
    // ...
  }

  async createLLMMessage(): Promise<unknown> {
    return await Promise.resolve(() => {
      return { mockResponse: true };
    });
  }
}

describe("AgentRegistry", () => {
  const mockModel1: Model = {
    id: "test-model-1",
    name: "Test Model 1",
    contextWindow: 100000,
    pricing: {
      input_cost: 100,
      output_cost: 300,
      cache_read_cost: 10,
      cache_write_cost: 125,
    },
  };

  const mockModel2: Model = {
    id: "test-model-2",
    name: "Test Model 2",
    contextWindow: 200000,
    pricing: {
      input_cost: 200,
      output_cost: 600,
      cache_read_cost: 20,
      cache_write_cost: 250,
    },
  };

  const mockAgentConfig: AgentConfig = {
    id: "test-provider",
    name: "Test Provider",
    models: [mockModel1, mockModel2],
    getInstance: (modelId: string) => {
      const model = mockAgentConfig.models.find((m) => m.id === modelId);
      if (!model) throw new Error(`Model ${modelId} not found`);
      return new MockAgent(model);
    },
  };

  beforeEach(() => {
    // Clear registry before each test by creating a fresh instance
    // Since AgentRegistry uses static methods, we need to clear the internal state
    const registry = AgentRegistry as any;
    registry.agents = new Map();
  });

  describe("register", () => {
    it("registers an agent config", () => {
      expect(() => AgentRegistry.register(mockAgentConfig)).not.toThrow();

      const agent = AgentRegistry.getAgent("test-provider");
      expect(agent).toEqual(mockAgentConfig);
    });

    it("allows registering multiple agents", () => {
      const secondAgentConfig: AgentConfig = {
        id: "second-provider",
        name: "Second Provider",
        models: [mockModel1],
        getInstance: (_modelId: string) => new MockAgent(mockModel1),
      };

      AgentRegistry.register(mockAgentConfig);
      AgentRegistry.register(secondAgentConfig);

      expect(AgentRegistry.getAgent("test-provider")).toEqual(mockAgentConfig);
      expect(AgentRegistry.getAgent("second-provider")).toEqual(
        secondAgentConfig,
      );
    });
  });

  describe("getInstance", () => {
    beforeEach(() => {
      AgentRegistry.register(mockAgentConfig);
    });

    it("returns agent instance for valid provider and model", () => {
      const instance = AgentRegistry.getInstance(
        "test-provider",
        "test-model-1",
      );

      expect(instance).toBeInstanceOf(MockAgent);
      expect(instance.model).toEqual(mockModel1);
    });

    it("returns agent instance for different model", () => {
      const instance = AgentRegistry.getInstance(
        "test-provider",
        "test-model-2",
      );

      expect(instance).toBeInstanceOf(MockAgent);
      expect(instance.model).toEqual(mockModel2);
    });

    it("throws error for non-existent provider", () => {
      const nonExistentProvider = "non-existent-provider";

      expect(() =>
        AgentRegistry.getInstance(nonExistentProvider, "test-model-1"),
      ).toThrow(llmMessages.error.provider_not_found(nonExistentProvider));
    });

    it("throws error for non-existent model", () => {
      const nonExistentModel = "non-existent-model";

      expect(() =>
        AgentRegistry.getInstance("test-provider", nonExistentModel),
      ).toThrow(llmMessages.error.model_not_found(nonExistentModel));
    });
  });

  describe("getAvailableProvidersWithModels", () => {
    it("returns empty array when no providers registered", () => {
      const providers = AgentRegistry.getAvailableProvidersWithModels();
      expect(providers).toEqual([]);
    });

    it("returns registered providers with models", () => {
      AgentRegistry.register(mockAgentConfig);

      const providers = AgentRegistry.getAvailableProvidersWithModels();

      expect(providers).toHaveLength(1);
      expect(providers[0]).toEqual({
        id: "test-provider",
        name: "Test Provider",
        models: [mockModel1, mockModel2],
      });
    });

    it("returns multiple providers", () => {
      const secondAgentConfig: AgentConfig = {
        id: "second-provider",
        name: "Second Provider",
        models: [mockModel1],
        getInstance: (_modelId: string) => new MockAgent(mockModel1),
      };

      AgentRegistry.register(mockAgentConfig);
      AgentRegistry.register(secondAgentConfig);

      const providers = AgentRegistry.getAvailableProvidersWithModels();

      expect(providers).toHaveLength(2);
      expect(providers.map((p) => p.id)).toContain("test-provider");
      expect(providers.map((p) => p.id)).toContain("second-provider");
    });

    it("excludes getInstance function from returned provider data", () => {
      AgentRegistry.register(mockAgentConfig);

      const providers = AgentRegistry.getAvailableProvidersWithModels();

      expect(providers[0]).not.toHaveProperty("getInstance");
    });
  });

  describe("getAgent", () => {
    beforeEach(() => {
      AgentRegistry.register(mockAgentConfig);
    });

    it("returns agent config for existing provider", () => {
      const agent = AgentRegistry.getAgent("test-provider");
      expect(agent).toEqual(mockAgentConfig);
    });

    it("throws error for non-existent provider", () => {
      const fakeProvider = "non-existent-provider";

      expect(() => AgentRegistry.getAgent(fakeProvider)).toThrow(
        llmMessages.error.provider_not_found(fakeProvider),
      );
    });
  });

  describe("getAllProviderIds", () => {
    it("returns empty array when no providers registered", () => {
      const providerIds = AgentRegistry.getAllProviderIds();
      expect(providerIds).toEqual([]);
    });

    it("returns registered provider IDs", () => {
      const secondAgentConfig: AgentConfig = {
        id: "second-provider",
        name: "Second Provider",
        models: [mockModel1],
        getInstance: (_modelId: string) => new MockAgent(mockModel1),
      };

      AgentRegistry.register(mockAgentConfig);
      AgentRegistry.register(secondAgentConfig);

      const providerIds = AgentRegistry.getAllProviderIds();

      expect(providerIds).toHaveLength(2);
      expect(providerIds).toContain("test-provider");
      expect(providerIds).toContain("second-provider");
    });
  });
});
