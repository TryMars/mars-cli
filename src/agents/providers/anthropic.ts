import { ProviderWithModels } from "#agents/agent_types.ts";
import { AgentInterface } from "#agents/agent_interface.ts";

export class Anthropic implements AgentInterface {
  getProviderWithModels(): ProviderWithModels {
    return {
      id: "anthropic",
      name: "Anthropic",
      models: [
        {
          id: "claude-opus-4-1-20250805",
          name: "Claude Opus 4.1",
        },
        {
          id: "claude-opus-4-20250514",
          name: "Claude Opus 4",
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude Opus 3",
        },
        {
          id: "claude-sonnet-4-20250514",
          name: "Claude Sonnet 4",
        },
        {
          id: "claude-3-7-sonnet-20250219",
          name: "Claude Sonnet 3.7",
        },
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude Sonnet 3.5 v2",
        },
        {
          id: "claude-3-5-sonnet-20240620",
          name: "Claude Sonnet 3.5",
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude Haiku 3",
        },
        {
          id: "claude-3-5-haiku-20241022",
          name: "Claude Haiku 3.5",
        },
      ],
    };
  }
}
