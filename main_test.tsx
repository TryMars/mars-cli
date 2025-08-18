import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { App } from "#components/app/app.tsx";
import { render } from "ink-testing-library";
import { headlessModeText } from "#components/mars/mars.tsx";
import { inputBoxPlaceholderText } from "#components/input_box/input_box.tsx";
import { llmMockResponse } from "#context/llm_context/llm_context.tsx";
import { defaultAssistantModelName } from "#services/chat_service/chat_service.ts";
import { exists } from "@std/fs";

const runCLI = async (
  args: Array<string> = [],
): Promise<Deno.CommandOutput> => {
  const process = new Deno.Command("deno", {
    args: ["run", "start", ...args],
    stdout: "piped",
    stdin: "piped",
    stderr: "null", // run command silently
  });

  const child = process.spawn();
  child.stdin.close();

  return await child.output();
};

describe(
  "integration tests",
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    describe("cli", () => {
      it("runs cli without crashing", async () => {
        const output = await runCLI();

        expect(output.success).toBe(true);
      });
    });

    describe("app", () => {
      const testMarsDir = `${Deno.cwd()}/tests/storage/.mars`;

      beforeAll(async () => {
        if (await exists(testMarsDir)) {
          await Deno.remove(testMarsDir);
        }
      });

      afterAll(async () => {
        if (await exists(testMarsDir)) {
          await Deno.remove(testMarsDir);
        }
      });

      describe("headless mode", () => {
        it("enters in headed mode by default", () => {
          const marsApp = <App />;

          const { lastFrame, cleanup } = render(marsApp);

          // should not see a headless mode confirmation message
          expect(lastFrame()).not.toContain(headlessModeText);

          cleanup();
        });

        it("can enter in headless mode", () => {
          const marsApp = <App headlessMode />;

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
        const marsApp = <App />;
        const { lastFrame, stdin, rerender, cleanup } = render(marsApp);
        const input = "this is my input";

        it("renders input box", () => {
          // should see the placeholder text as our input box
          // should be empty at this point.
          expect(lastFrame()).toContain(inputBoxPlaceholderText);
        });

        describe("user input", () => {
          it("handles submitting", () => {
            stdin.write(input);
            rerender(marsApp);

            expect(lastFrame()).not.toContain(inputBoxPlaceholderText);
            expect(lastFrame()).toContain(input);

            // \r is the equivalent of pressing "enter/return"
            stdin.write("\r");
            rerender(marsApp);

            // we should see the placeholder again since the input
            // box should be cleared after submit
            expect(lastFrame()).toContain(inputBoxPlaceholderText);
          });

          it("displays input", () => {
            // we should also see the input as it should be displayed in the
            // message list component with the "> " prefix
            expect(lastFrame()).toContain(`> ${input}`);
          });

          it("displays current llm", () => {
            expect(lastFrame()).toContain(defaultAssistantModelName);
          });

          it("displays loading indicator", () => {
            expect(lastFrame()).toContain("Thinking...");
          });

          it("receives response from llm", () => {
            setTimeout(() => {
              // wait for the loading indicator to dissapear then rerender
              rerender(marsApp);

              // we should see the llm mock response in the message
              // list with the ⏺ prefix
              expect(lastFrame()).toContain(`⏺  ${llmMockResponse}`);
            }, 1);
          });
        });

        cleanup();
      });
    });
  },
);
