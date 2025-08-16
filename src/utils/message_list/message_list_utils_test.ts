import { describe, it } from "@std/testing/bdd";
import {
  getMessageColor,
  getMessagePrefix,
} from "#utils/message_list/message_list_utils.tsx";
import { expect } from "@std/expect";
import { PropsWithChildren, ReactElement } from "react";
import { Text } from "ink";
import { TextProps } from "ink";

describe("message list unit tests", () => {
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

    it("returns ⏺ for assistant messages", () => {
      const prefix = getMessagePrefix("assistant") as ReactElement<Text>;

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
});
