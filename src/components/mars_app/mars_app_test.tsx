import { describe, it } from "@std/testing/bdd";
import { createElement } from "react";
import { MarsApp } from "./mars_app.tsx";
import { expect } from "@std/expect";
import { inputBoxPlaceholderText } from "#src/components/input_box/input_box.tsx";
import { render } from "ink-testing-library";

describe(
  "mars integration tests",
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    // TODO: check for message instead of props
    describe("headless mode", () => {
      it("sets headless mode to false by default", () => {
        const component = createElement(MarsApp);

        expect(component.props.headlessMode).toBe(undefined);
      });

      it("can set headless mode to be true", () => {
        const component = createElement(MarsApp, { headlessMode: true });

        expect(component.props.headlessMode).toBe(true);
      });
    });

    // TODO: check for message instead of props
    describe("input box", () => {
      it("renders component", () => {
        const { lastFrame, cleanup } = render(<MarsApp />);

        expect(lastFrame()).toContain(inputBoxPlaceholderText);

        cleanup();
      });

      it("handles input and submit", () => {
        const input = "this is my input";

        const { lastFrame, stdin, cleanup, rerender } = render(<MarsApp />);

        stdin.write(input);
        rerender(<MarsApp />);

        expect(lastFrame()).not.toContain(inputBoxPlaceholderText);
        expect(lastFrame()).toContain(input);

        stdin.write("\r");
        rerender(<MarsApp />);

        expect(lastFrame()).toContain(inputBoxPlaceholderText);

        cleanup();
      });
    });
  },
);
