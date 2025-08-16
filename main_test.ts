import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { headlessModeText } from "#src/components/mars_app/mars_app.tsx";

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

  const output = await child.output();

  return output;
};

describe("cli integration tests", () => {
  it("runs cli without crashing", async () => {
    const output = await runCLI();

    expect(output.success).toBe(true);
  });

  describe("headless mode", () => {
    it("runs cli withoutout headless argument", async () => {
      const output = await runCLI();
      const stdout = new TextDecoder().decode(output.stdout);

      expect(stdout).not.toContain(headlessModeText);
      expect(output.success).toBe(true);
    });

    it("runs cli with headless argument", async () => {
      const output = await runCLI(["--headless"]);
      const stdout = new TextDecoder().decode(output.stdout);

      expect(stdout).toContain(headlessModeText);
      expect(output.success).toBe(true);
    });
  });
});
