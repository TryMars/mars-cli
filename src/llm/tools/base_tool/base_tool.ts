import { ToolInterface } from "#llm/tools/tool_interface.ts";

// TODO: need to test this
export abstract class BaseTool<TToolParams = object> implements ToolInterface {
  public abstract name: string;
  public abstract description: string;

  protected abstract getToolResponse(params: TToolParams): string;
  protected abstract getToolLoadingMessage(params: TToolParams): string;

  async displayToolLoadingMessage(params: TToolParams): Promise<void> {
    await Promise.resolve(console.log(this.getToolLoadingMessage(params)));
  }

  async run(params: TToolParams): Promise<string> {
    await this.displayToolLoadingMessage(params);

    return await Promise.resolve(this.getToolResponse(params));
  }
}
