import { render } from "ink";
import { MarsApp } from "#src/components/mars_app/mars_app.tsx";
import { parseCommandLineFlags } from "#utils/cli/cli_utils.ts";
import { MessageProvider } from "#src/context/message_context/message_context.tsx";

if (import.meta.main) {
  render(
    <MessageProvider>
      <MarsApp {...parseCommandLineFlags(Deno.args)} />
    </MessageProvider>,
  );
}
