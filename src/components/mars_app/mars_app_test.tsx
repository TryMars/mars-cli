import { describe, it } from "@std/testing/bdd";
import {
  headlessModeText,
  MarsApp,
} from "#src/components/mars_app/mars_app.tsx";
import { expect } from "@std/expect";
import { inputBoxPlaceholderText } from "#src/components/input_box/input_box.tsx";
import { render } from "ink-testing-library";
import { MessageProvider } from "#src/context/message_context/message_context.tsx";

describe(
  "mars integration tests",
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    describe("headless mode", () => {
      it("enters in headed mode by default", () => {
        const marsApp = (
          <MessageProvider>
            <MarsApp />
          </MessageProvider>
        );

        const { lastFrame, cleanup } = render(marsApp);

        // should not see a headless mode confirmation message
        expect(lastFrame()).not.toContain(headlessModeText);

        cleanup();
      });

      it("can enter in headless mode", () => {
        const marsApp = (
          <MessageProvider>
            <MarsApp headlessMode />
          </MessageProvider>
        );

        const { lastFrame, cleanup, rerender } = render(marsApp);

        // needs to rerender to give the headless mode confirmation
        // message the time it needs to display.
        rerender(marsApp);

        // should see a headless mode confirmation message
        expect(lastFrame()).toContain(headlessModeText);

        cleanup();
      });
    });

    describe("input box", () => {
      const marsApp = (
        <MessageProvider>
          <MarsApp />
        </MessageProvider>
      );

      const { lastFrame, stdin, rerender, cleanup } = render(marsApp);

      it("renders component", () => {
        // should see the placeholder text as our input box
        // should be empty at this point.
        expect(lastFrame()).toContain(inputBoxPlaceholderText);
      });

      it("handles,submits,displays input", () => {
        const input = "this is my input";

        stdin.write(input);
        rerender(marsApp);

        expect(lastFrame()).not.toContain(inputBoxPlaceholderText);
        expect(lastFrame()).toContain(input);

        // \r is the equivalent of pressing "enter/return"
        stdin.write("\r");
        rerender(marsApp);

        // we should see the placeholder again since the inpout
        // box should be cleared after submit
        expect(lastFrame()).toContain(inputBoxPlaceholderText);

        // we should also see the input as it should be displayed in the
        // message list component with the "> " prefix since it is
        // a user message that we're displaying.
        expect(lastFrame()).toContain(`> ${input}`);
      });

      cleanup();
    });
  },
);
