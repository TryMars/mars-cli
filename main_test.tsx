import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { App } from "#components/app/app.tsx";
import { render } from "ink-testing-library";
import {
  defaultAssistantModelId,
  defaultAssistantModelName,
  defaultAssistantProviderId,
} from "#services/chat_service/chat_service.ts";
import { exists } from "@std/fs";
import { getAgentInstanceByProviderId } from "#agents/agents.ts";
import { ANY_TODO } from "#shared/types.ts";
import { stub } from "jsr:@std/testing/mock";
import { inputBoxMessages } from "#components/input_box/input_box_messages.ts";
import { marsMessages } from "#components/mars/mars_messages.ts";

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
          expect(lastFrame()).not.toContain(marsMessages.headless.enabled());

          cleanup();
        });

        it("can enter in headless mode", () => {
          const marsApp = <App headlessMode />;

          const { lastFrame, cleanup, rerender } = render(marsApp);

          // needs to rerender to give the headless mode confirmation
          // message the time it needs to display.
          rerender(marsApp);

          // should see a headless mode confirmation message
          expect(lastFrame()).toContain(marsMessages.headless.enabled());

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
          expect(lastFrame()).toContain(inputBoxMessages.input.placeholder());
        });

        describe("user input", () => {
          const agent = getAgentInstanceByProviderId({
            providerId: defaultAssistantProviderId,
            modelId: defaultAssistantModelId,
          });

          const mockedResponseContent1 = "Hello! This is ";
          const mockedResponseContent2 = "mocked content.";

          stub(agent, "getStreamedEvents", () => {
            return Promise.resolve([
              {
                type: "content_block_delta",
                delta: {
                  type: "text_delta",
                  text: mockedResponseContent1,
                },
              },
              {
                type: "content_block_delta",
                delta: {
                  type: "text_delta",
                  text: mockedResponseContent2,
                },
              },
              {
                type: "message_delta",
                usage: {
                  input_tokens: 8,
                  output_tokens: 15,
                  cache_read_input_tokens: 0,
                  cache_creation_input_tokens: 0,
                },
              },
            ]) as ANY_TODO;
          });

          it("handles submitting empty input", () => {
            // \r is the equivalent of pressing "enter/return"
            stdin.write("\r");
            rerender(marsApp);

            // we should not see the loader since nothing was submitted
            expect(lastFrame()).not.toContain("Thinking...");
          });

          it("handles submitting", () => {
            stdin.write(input);
            rerender(marsApp);

            expect(lastFrame()).not.toContain(
              inputBoxMessages.input.placeholder(),
            );
            expect(lastFrame()).toContain(input);

            // \r is the equivalent of pressing "enter/return"
            stdin.write("\r");
            rerender(marsApp);

            // we should see the placeholder again since the input
            // box should be cleared after submit
            expect(lastFrame()).toContain(inputBoxMessages.input.placeholder());
          });

          it("displays input", () => {
            // we should also see the input as it should be displayed in the
            // message list component with the "> " prefix
            expect(lastFrame()).toContain(`> ${input}`);
          });

          it("displays current llm", () => {
            expect(lastFrame()).toContain(defaultAssistantModelName);
          });

          it("displays current usage", () => {
            expect(lastFrame()).toContain("Context Window Usage: 0%");
          });

          it("displays loading indicator", () => {
            expect(lastFrame()).toContain("Thinking...");
          });

          it("receives response from llm", () => {
            rerender(marsApp);

            expect(lastFrame()).toContain(
              "⏺ " + mockedResponseContent1 + mockedResponseContent2,
            );
          });
        });

        cleanup();
      });
    });
  },
);
