import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";

const runCLI = async (
  args: Array<string> = [],
): Promise<Deno.CommandOutput> => {
  const process = new Deno.Command("deno", {
    args: ["run", "start", ...args],
    stdout: "piped",
    stdin: "piped",
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
    const headlessModeMessage: string = "Entered Mars CLI in headless mode";

    it("runs cli withoutout headless argument", async () => {
      const output = await runCLI();
      const stdout = new TextDecoder().decode(output.stdout);

      expect(stdout).not.toContain(headlessModeMessage);
      expect(output.success).toBe(true);
    });

    it("runs cli with headless argument", async () => {
      const output = await runCLI(["--headless"]);
      const stdout = new TextDecoder().decode(output.stdout);

      expect(stdout).toContain(headlessModeMessage);
      expect(output.success).toBe(true);
    });
  });
});
