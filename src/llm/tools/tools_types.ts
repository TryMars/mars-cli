import Anthropic from "@anthropic-ai/sdk";
import { ToolInterface } from "./tool_interface.ts";

export type ToolConfigSchema = Anthropic.Tool;
export type ToolConfigInputSchema = Anthropic.Tool.InputSchema;

export type ToolConfig = {
  tool: ToolInterface;
  schema: ToolConfigSchema;
};
