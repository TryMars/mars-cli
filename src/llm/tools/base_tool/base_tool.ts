import { ToolInterface } from "#llm/tools/tool_interface.ts";
import { MessageContextState } from "#context/message_context/message_context_types.ts";
import { ToolConfigInputSchema } from "../tools_types.ts";

// TODO: need to test this
export abstract class BaseTool<TToolParams = object> implements ToolInterface {
  public abstract name: string;
  public abstract description: string;
  public abstract input_schema: ToolConfigInputSchema;

  protected abstract getToolResponse(params: TToolParams): Promise<string>;
  protected abstract getToolLoadingMessage(params: TToolParams): string;

  protected async displayToolLoadingMessage(
    addMessage: MessageContextState["addMessage"],
    params: TToolParams,
  ): Promise<void> {
    return await Promise.resolve().then(() => {
      addMessage({
        content: this.getToolLoadingMessage(params),
        from: "assistant",
      });
    });
  }

  async run(
    addMessage: MessageContextState["addMessage"],
    params: TToolParams,
  ): Promise<string> {
    await this.displayToolLoadingMessage(addMessage, params);

    return await this.getToolResponse(params);
  }
}
