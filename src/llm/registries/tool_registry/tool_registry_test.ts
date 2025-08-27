import { describe, it, beforeEach } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { ToolRegistry } from "./tool_registry.ts";
import { ToolConfig, ToolConfigSchema } from "#llm/tools/tools_types.ts";
import { ToolInterface } from "#llm/tools/tool_interface.ts";
import { llmMessages } from "#llm/llm_messages.ts";

class MockTool implements ToolInterface {
  constructor(public name: string) {}

  async displayToolLoadingMessage(_params: unknown): Promise<void> {
    // ...
  }

  async run(_params: unknown): Promise<string> {
    return await Promise.resolve(`Mock result for ${this.name}`);
  }
}

describe("ToolRegistry", () => {
  const mockSchema1: ToolConfigSchema = {
    name: "test-tool-1",
    description: "Test Tool 1",
    input_schema: {
      type: "object",
      properties: {
        param1: { type: "string" },
      },
    },
  };

  const mockSchema2: ToolConfigSchema = {
    name: "test-tool-2",
    description: "Test Tool 2",
    input_schema: {
      type: "object",
      properties: {
        param2: { type: "number" },
      },
    },
  };

  const mockToolConfig1: ToolConfig = {
    tool: new MockTool("test-tool-1"),
    schema: mockSchema1,
  };

  const mockToolConfig2: ToolConfig = {
    tool: new MockTool("test-tool-2"),
    schema: mockSchema2,
  };

  beforeEach(() => {
    // Clear registry before each test by creating a fresh instance
    // Since ToolRegistry uses static methods, we need to clear the internal state
    const registry = ToolRegistry as any;
    registry.tools = new Map();
  });

  describe("register", () => {
    it("registers a tool config", () => {
      expect(() => ToolRegistry.register(mockToolConfig1)).not.toThrow();

      const tool = ToolRegistry.getTool("test-tool-1");
      expect(tool).toEqual(mockToolConfig1);
    });

    it("allows registering multiple tools", () => {
      ToolRegistry.register(mockToolConfig1);
      ToolRegistry.register(mockToolConfig2);

      expect(ToolRegistry.getTool("test-tool-1")).toEqual(mockToolConfig1);
      expect(ToolRegistry.getTool("test-tool-2")).toEqual(mockToolConfig2);
    });
  });

  describe("getTool", () => {
    beforeEach(() => {
      ToolRegistry.register(mockToolConfig1);
    });

    it("returns tool config for existing tool", () => {
      const tool = ToolRegistry.getTool("test-tool-1");
      expect(tool).toEqual(mockToolConfig1);
    });

    it("throws error for non-existent tool", () => {
      const nonExistentTool = "non-existent-tool";

      expect(() => ToolRegistry.getTool(nonExistentTool)).toThrow(
        llmMessages.error.tool_not_found(nonExistentTool),
      );
    });
  });

  describe("getInstance", () => {
    beforeEach(() => {
      ToolRegistry.register(mockToolConfig1);
    });

    it("returns tool instance for valid tool name", () => {
      const instance = ToolRegistry.getInstance("test-tool-1");

      expect(instance).toBeInstanceOf(MockTool);
    });

    it("returns undefined for non-existent tool", () => {
      expect(() => ToolRegistry.getInstance("non-existent-tool")).toThrow(
        llmMessages.error.tool_not_found("non-existent-tool"),
      );
    });
  });

  describe("getTools", () => {
    it("returns empty array when no tools registered", () => {
      const tools = ToolRegistry.getTools();
      expect(tools).toEqual([]);
    });

    it("returns registered tool schemas", () => {
      ToolRegistry.register(mockToolConfig1);

      const tools = ToolRegistry.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0]).toEqual(mockSchema1);
    });

    it("returns multiple tool schemas", () => {
      ToolRegistry.register(mockToolConfig1);
      ToolRegistry.register(mockToolConfig2);

      const tools = ToolRegistry.getTools();

      expect(tools).toHaveLength(2);
      expect(tools.map((t) => t.name)).toContain("test-tool-1");
      expect(tools.map((t) => t.name)).toContain("test-tool-2");
    });

    it("excludes tool instances from returned schemas", () => {
      ToolRegistry.register(mockToolConfig1);

      const tools = ToolRegistry.getTools();

      expect(tools[0]).not.toHaveProperty("tool");
    });
  });
});

