import { AgentConfig } from "#llm/agents/agents_types.ts";
import { Anthropic } from "./anthropic.ts";

export const AnthropicConfig: AgentConfig = {
  id: "anthropic",
  name: "Anthropic",
  models: [
    {
      id: "claude-opus-4-1-20250805",
      name: "Claude Opus 4.1",
      contextWindow: 200000,
      pricing: {
        input_cost: 1500,
        output_cost: 7500,
        cache_read_cost: 150,
        cache_write_cost: 1875,
      },
    },
    {
      id: "claude-opus-4-20250514",
      name: "Claude Opus 4",
      contextWindow: 200000,
      pricing: {
        input_cost: 1500,
        output_cost: 7500,
        cache_read_cost: 150,
        cache_write_cost: 1875,
      },
    },
    {
      id: "claude-3-opus-20240229",
      name: "Claude Opus 3",
      contextWindow: 200000,
      pricing: {
        input_cost: 1500,
        output_cost: 7500,
        cache_read_cost: 150,
        cache_write_cost: 1875,
      },
    },
    {
      id: "claude-sonnet-4-20250514",
      name: "Claude Sonnet 4",
      contextWindow: 200000,
      pricing: {
        input_cost: 300,
        output_cost: 1500,
        cache_read_cost: 30,
        cache_write_cost: 375,
      },
    },
    {
      id: "claude-3-7-sonnet-20250219",
      name: "Claude Sonnet 3.7",
      contextWindow: 200000,
      pricing: {
        input_cost: 300,
        output_cost: 1500,
        cache_read_cost: 30,
        cache_write_cost: 375,
      },
    },
    {
      id: "claude-3-5-sonnet-20241022",
      name: "Claude Sonnet 3.5 v2",
      contextWindow: 200000,
      pricing: {
        input_cost: 300,
        output_cost: 1500,
        cache_read_cost: 30,
        cache_write_cost: 375,
      },
    },
    {
      id: "claude-3-5-sonnet-20240620",
      name: "Claude Sonnet 3.5",
      contextWindow: 200000,
      pricing: {
        input_cost: 300,
        output_cost: 1500,
        cache_read_cost: 30,
        cache_write_cost: 375,
      },
    },
    {
      id: "claude-3-5-haiku-20241022",
      name: "Claude Haiku 3.5",
      contextWindow: 200000,
      pricing: {
        input_cost: 80,
        output_cost: 400,
        cache_read_cost: 8,
        cache_write_cost: 100,
      },
    },
    {
      id: "claude-3-haiku-20240307",
      name: "Claude Haiku 3",
      contextWindow: 200000,
      pricing: {
        input_cost: 25,
        output_cost: 125,
        cache_read_cost: 3,
        cache_write_cost: 30,
      },
    },
  ],
  getInstance: (modelId: string) => Anthropic.getInstance(modelId),
};
