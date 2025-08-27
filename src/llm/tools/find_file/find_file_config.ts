import { FindFile } from "./find_file.ts";
import { ToolConfig } from "#llm/tools/tools_types.ts";

const findFile = FindFile.getInstance();

export const FindFileConfig: ToolConfig = {
  tool: findFile,
  schema: {
    name: findFile.name,
    description: findFile.description,
    input_schema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "The name of the file we are searching for",
        },
      },
      required: ["filename"],
    },
  },
};
