import { render } from "ink";
import { MarsApp } from "#src/components/mars_app/mars_app.tsx";
import { parseCommandLineFlags } from "#src/utils/cli/cli.ts";

if (import.meta.main) {
  render(<MarsApp {...parseCommandLineFlags(Deno.args)} />);
}
