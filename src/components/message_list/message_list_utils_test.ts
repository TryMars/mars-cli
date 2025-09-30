import { describe, it } from "@std/testing/bdd";
import {
  getMessageColor,
  getMessagePrefix,
  stripMarkdownSyntax,
  formatMessageContent,
} from "./message_list_utils.tsx";
import { expect } from "@std/expect";
import { PropsWithChildren, ReactElement } from "react";
import { Text } from "ink";
import { TextProps } from "ink";

describe("message list utils", () => {
  describe("getMessageColor", () => {
    it("returns green for a success state", () => {
      const color = getMessageColor("success");

      expect(color).toBe("green");
    });

    it("returns yellow for a warning state", () => {
      const color = getMessageColor("warning");

      expect(color).toBe("yellow");
    });

    it("returns red for an error state", () => {
      const color = getMessageColor("error");

      expect(color).toBe("red");
    });

    it("returns nothing for neutral state", () => {
      const color = getMessageColor("neutral");

      expect(color).toBe("");
    });
  });

  describe("getMessagePrefix", () => {
    it("returns > for user messages", () => {
      const prefix = getMessagePrefix("user") as ReactElement<Text>;

      const prefixProps = prefix.props as PropsWithChildren & {
        dimColor: TextProps["dimColor"];
      };

      expect(prefix.type).toBe(Text);
      expect(prefixProps.children).toBe(">");
      expect(prefixProps.dimColor).toBe(true);
    });

    it("returns white ⏺  for assistant messages", () => {
      const prefix = getMessagePrefix("assistant") as ReactElement<Text>;

      const prefixProps = prefix.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(prefix.type).toBe(Text);
      expect(prefixProps.children).toBe("⏺");
      expect(prefixProps.color).toBe("white");
    });

    it("returns green ⏺  for tool_call messages", () => {
      const prefix = getMessagePrefix("tool_call") as ReactElement<Text>;

      const prefixProps = prefix.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(prefix.type).toBe(Text);
      expect(prefixProps.children).toBe("⏺");
      expect(prefixProps.color).toBe("green");
    });

    it("returns red ⏺  for tool_call_error messages", () => {
      const prefix = getMessagePrefix("tool_call_error") as ReactElement<Text>;

      const prefixProps = prefix.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(prefix.type).toBe(Text);
      expect(prefixProps.children).toBe("⏺");
      expect(prefixProps.color).toBe("red");
    });

    it("returns an empty string for system messages", () => {
      const prefix = getMessagePrefix("system");

      expect(typeof prefix).toBe("string");
      expect(prefix).toBe("");
    });
  });

  describe("stripMarkdownSyntax", () => {
    it("strips certain markdown syntax", () => {
      let content = "## Hello, *my* _friend_.";

      content = stripMarkdownSyntax(content);

      expect(content).toBe("Hello, my friend.");
    });
  });

  describe("formatMessageContent", () => {
    it("returns content as-is for non-assistant messages", () => {
      const message = {
        from: "user",
        content: "Hello `code` world",
        id: "1",
        state: "neutral",
        timestamp: new Date(),
      } as const;

      const result = formatMessageContent(message);

      expect(result).toEqual(["Hello `code` world"]);
    });

    it("formats inline code with magenta color for assistant messages", () => {
      const message = {
        from: "assistant",
        content: "Use `console.log` to debug",
        id: "1",
        state: "neutral",
        timestamp: new Date(),
      } as const;

      const result = formatMessageContent(message);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe("Use ");

      const codeElement = result[1] as ReactElement<Text>;
      const codeElementProps = codeElement.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(codeElement.type).toBe(Text);
      expect(codeElementProps.color).toBe("magenta");
      expect(codeElementProps.children).toBe("console.log");

      expect(result[2]).toBe(" to debug");
    });

    it("handles multiple inline code blocks", () => {
      const message = {
        from: "assistant",
        content: "Use `npm install` then `npm start`",
        id: "1",
        state: "neutral",
        timestamp: new Date(),
      } as const;

      const result = formatMessageContent(message);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(5);
      expect(result[0]).toBe("Use ");

      const firstCode = result[1] as ReactElement<Text>;
      const firstCodeProps = firstCode.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(firstCode.type).toBe(Text);
      expect(firstCodeProps.color).toBe("magenta");
      expect(firstCodeProps.children).toBe("npm install");

      expect(result[2]).toBe(" then ");

      const secondCode = result[3] as ReactElement<Text>;
      const secondCodeProps = secondCode.props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(secondCode.type).toBe(Text);
      expect(secondCodeProps.color).toBe("magenta");
      expect(secondCodeProps.children).toBe("npm start");

      expect(result[4]).toBe("");
    });

    it("preserves code blocks and only formats inline code", () => {
      const message = {
        from: "assistant",
        content:
          "Use `console.log` in:\n```js\nfunction test() {\n  console.log('hello');\n}\n```\nThen run `node script.js`",
        id: "1",
        state: "neutral",
        timestamp: new Date(),
      } as const;

      const result = formatMessageContent(message);

      expect(Array.isArray(result)).toBe(true);

      // find the code block part
      const codeBlockIndex = result.findIndex(
        (part) => typeof part === "string" && part.includes("```js"),
      );
      expect(codeBlockIndex).toBeGreaterThan(-1);
      expect(result[codeBlockIndex]).toContain(
        "```js\nfunction test() {\n  console.log('hello');\n}\n```",
      );

      // check that inline code is still formatted
      const inlineCodeElements = result.filter(
        (part) => typeof part === "object" && part.type === Text,
      ) as ReactElement<Text>[];

      expect(inlineCodeElements).toHaveLength(2);

      const firstInlineProps = inlineCodeElements[0]
        .props as PropsWithChildren & {
        color: TextProps["color"];
      };
      const secondInlineProps = inlineCodeElements[1]
        .props as PropsWithChildren & {
        color: TextProps["color"];
      };

      expect(firstInlineProps.color).toBe("magenta");
      expect(firstInlineProps.children).toBe("console.log");
      expect(secondInlineProps.color).toBe("magenta");
      expect(secondInlineProps.children).toBe("node script.js");
    });
  });
});
