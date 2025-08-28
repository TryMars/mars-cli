import { ToolInterface } from "#llm/tools/tool_interface.ts";
import { ToolConfig, ToolConfigSchema } from "#llm/tools/tools_types.ts";
import { llmMessages } from "#llm/llm_messages.ts";

export class ToolRegistry {
  private static tools = new Map<string, ToolConfig>();

  static register(tool: ToolConfig): void {
    this.tools.set(tool.schema.name, tool);
  }

  static getTool(toolName: string): ToolConfig {
    const tool = this.tools.get(toolName);

    if (tool === undefined) {
      throw new TypeError(llmMessages.error.tool_not_found(toolName));
    }

    return tool;
  }

  static getInstance(toolName: string): ToolInterface {
    return this.getTool(toolName).tool;
  }

  static getTools(): ToolConfigSchema[] {
    return Array.from(this.tools.values()).map(
      (tool: ToolConfig) => tool.schema,
    );
  }
}
