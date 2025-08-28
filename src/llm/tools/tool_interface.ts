import { MessageContextState } from "#context/message_context/message_context_types.ts";

export interface ToolInterface {
  run(
    addMessage: MessageContextState["addMessage"],
    params: unknown,
  ): Promise<string>;
}
