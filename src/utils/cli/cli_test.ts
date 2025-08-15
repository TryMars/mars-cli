import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { parseCommandLineFlags } from "#src/utils/cli/cli.ts";

describe("cli utils", () => {
  it("can extract relevant arguments", () => {
    const argArray: Array<string> = ["--headless", "--fake-argument"];

    const args = parseCommandLineFlags(argArray);

    expect(args).toEqual({ headlessMode: true });
  });
});
