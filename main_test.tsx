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
import { getAgentInstanceByProviderId } from "#llm/llm.ts";
import { stub } from "jsr:@std/testing/mock";
import { inputBoxMessages } from "#components/input_box/input_box_messages.ts";
import { moonlightMessages } from "#components/moonlight/moonlight_messages.ts";

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
      const testMoonlightDir = `${Deno.cwd()}/tests/storage/.moonlight`;

      beforeAll(async () => {
        if (await exists(testMoonlightDir)) {
          await Deno.remove(testMoonlightDir, { recursive: true });
        }
      });

      afterAll(async () => {
        if (await exists(testMoonlightDir)) {
          await Deno.remove(testMoonlightDir, { recursive: true });
        }
      });

      describe("headless mode", () => {
        it("enters in headed mode by default", () => {
          const moonlightApp = <App />;

          const { lastFrame, cleanup } = render(moonlightApp);

          // should not see a headless mode confirmation message
          expect(lastFrame()).not.toContain(
            moonlightMessages.headless.enabled(),
          );

          cleanup();
        });

        it("can enter in headless mode", () => {
          const moonlightApp = <App headlessMode />;

          const { lastFrame, cleanup, rerender } = render(moonlightApp);

          // needs to rerender to give the headless mode confirmation
          // message the time it needs to display.
          rerender(moonlightApp);

          // should see a headless mode confirmation message
          expect(lastFrame()).toContain(moonlightMessages.headless.enabled());

          cleanup();
        });
      });

      describe("input box", () => {
        const moonlightApp = <App />;
        const { lastFrame, stdin, rerender, cleanup } = render(moonlightApp);
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

          const mockedResponseContent = "Hello! This is mocked content.";

          stub(agent, "createLLMMessage", () => {
            return Promise.resolve({
              id: "msg_01LF55udgebPY2ht18PWYFEQ",
              type: "message",
              role: "assistant",
              model: "claude-sonnet-4-20250514",
              content: [
                {
                  type: "text",
                  text: mockedResponseContent,
                },
              ],
              stop_reason: "end_turn",
              stop_sequence: null,
              usage: {
                input_tokens: 8,
                cache_creation_input_tokens: 0,
                cache_read_input_tokens: 0,
                cache_creation: {
                  ephemeral_5m_input_tokens: 0,
                  ephemeral_1h_input_tokens: 0,
                },
                output_tokens: 20,
                service_tier: "standard",
              },
            });
          });

          it("handles submitting empty input", () => {
            // \r is the equivalent of pressing "enter/return"
            stdin.write("\r");
            rerender(moonlightApp);

            // we should not see the loader since nothing was submitted
            expect(lastFrame()).not.toContain("Thinking...");
          });

          it("handles submitting", () => {
            stdin.write(input);
            rerender(moonlightApp);

            expect(lastFrame()).not.toContain(
              inputBoxMessages.input.placeholder(),
            );
            expect(lastFrame()).toContain(input);

            // \r is the equivalent of pressing "enter/return"
            stdin.write("\r");
            rerender(moonlightApp);

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

          it("displays current context window usage", () => {
            expect(lastFrame()).toContain("Context Window: 0%");
          });

          it("displays current cost usage", () => {
            expect(lastFrame()).toContain("Spent: $0.00");
          });

          it("displays loading indicator", () => {
            expect(lastFrame()).toContain("Thinking...");
          });

          it("receives response from llm", () => {
            rerender(moonlightApp);

            expect(lastFrame()).toContain("⏺ " + mockedResponseContent);
          });
        });

        cleanup();
      });
    });
  },
);
