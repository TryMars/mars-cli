import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect/expect";
import { parseCommandLineFlags } from "./main_utils.ts";

describe("main utils", () => {
  it("can extract relevant arguments", () => {
    const argArray: Array<string> = ["--headless", "--fake-argument"];

    const args = parseCommandLineFlags(argArray);

    expect(args).toEqual({ headlessMode: true });
  });
});
