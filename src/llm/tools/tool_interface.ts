export interface ToolInterface {
  displayToolLoadingMessage(params: unknown): Promise<void>;

  run(params: unknown): Promise<string>;
}
