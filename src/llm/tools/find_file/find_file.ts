import { BaseTool } from "#llm/tools/base_tool/base_tool.ts";
import { FindFileToolParams } from "./find_file_types.ts";

export class FindFile extends BaseTool<FindFileToolParams> {
  private static instance: FindFile | null;

  public name: string = "find_file";

  public description: string =
    "Find a file within your current working directory";

  private constructor() {
    super();
  }

  static getInstance(): FindFile {
    if (!FindFile.instance) {
      FindFile.instance = new FindFile();
    }

    return FindFile.instance;
  }

  protected getToolLoadingMessage(params: FindFileToolParams): string {
    return `🔎 Finding ${params.filename} file...`;
  }

  protected getToolResponse(params: FindFileToolParams): string {
    // TODO: run the tool and send a string response back to llm
    return params.filename;
  }
}
