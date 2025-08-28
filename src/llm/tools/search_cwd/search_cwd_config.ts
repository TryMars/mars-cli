import { SearchCWD } from "./search_cwd.ts";
import { ToolConfig } from "#llm/tools/tools_types.ts";

const search = SearchCWD.getInstance();

export const SearchCWDConfig: ToolConfig = {
  tool: search,
  schema: {
    name: search.name,
    description: search.description,
    input_schema: search.input_schema,
  },
};
