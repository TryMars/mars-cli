import { render } from "ink";
import { parseCommandLineFlags } from "./main_utils.ts";
import { App } from "#components/app/app.tsx";

if (import.meta.main) {
  const commandLineFlags = parseCommandLineFlags(Deno.args);

  render(<App {...commandLineFlags} />);
}
