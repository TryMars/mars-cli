export type SearchCWDToolParams = {
  query: string;
  type:
    | "filename"
    | "content"
    | "project_overview"
    | "read_files"
    | "file_tree";
  fileTypes: string[];
  files?: string[]; // For read_files mode
};
