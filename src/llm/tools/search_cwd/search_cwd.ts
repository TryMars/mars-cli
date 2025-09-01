import { BaseTool } from "#llm/tools/base_tool/base_tool.ts";
import { ToolConfigInputSchema } from "#llm/tools/tools_types.ts";
import { SearchCWDToolParams } from "./search_cwd_types.ts";

export class SearchCWD extends BaseTool<SearchCWDToolParams> {
  private static instance: SearchCWD | null;
  private gitignorePatterns: string[] = [];

  public name: string = "search_cwd";

  public description: string =
    "Multi-purpose tool for searching and analyzing your current working directory. Supports targeted search, content search, project overview, file tree generation, and reading multiple files with smart sampling.";

  public input_schema: ToolConfigInputSchema = {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The glob pattern query that we're searching our current working directory for. Could be a filename, or content within a file.",
      },
      type: {
        type: "string",
        enum: [
          "filename",
          "content",
          "project_overview",
          "read_files",
          "file_tree",
        ],
        description:
          "Operation mode: 'filename' (search by filename), 'content' (search within files), 'project_overview' (get project structure + stats), 'read_files' (read specified files with smart sampling), 'file_tree' (just directory structure).",
      },
      fileTypes: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional list of file extensions (e.g., ['ts','tsx','js']) to restrict results.",
      },
      files: {
        type: "array",
        items: { type: "string" },
        description:
          "List of specific files to read (required for 'read_files' mode).",
      },
    },
    required: ["type"],
  };

  private constructor() {
    super();
  }

  static getInstance(): SearchCWD {
    if (!SearchCWD.instance) {
      SearchCWD.instance = new SearchCWD();
    }

    return SearchCWD.instance;
  }

  protected getToolLoadingMessage(params: SearchCWDToolParams): string {
    switch (params.type) {
      case "content":
        return `Searching file contents for ("${params.query}")...`;
      case "filename":
        return `Searching files for ("${params.query}")...`;
      case "project_overview":
        return "Analyzing project structure and generating overview...";
      case "read_files":
        return `Reading ${params.files?.length || 0} selected files for clearer understanding...`;
      case "file_tree":
        return "Generating project file tree...";
      default:
        return `Searching for ("${params.query}")`;
    }
  }

  protected async getToolResponse(
    params: SearchCWDToolParams,
  ): Promise<string> {
    const { query, type, fileTypes = [], files = [] } = params;

    // Handle new project analysis modes
    switch (type) {
      case "project_overview":
        return await this.getProjectOverview();
      case "read_files":
        return await this.readSelectedFiles(files);
      case "file_tree":
        return await this.getFileTree();
      case "filename":
      case "content":
        // Continue with existing search logic below
        break;
      default:
        return "Invalid operation type";
    }

    // Existing search logic for filename/content
    // 1) Try ripgrep
    if (await this._hasCmd("rg")) {
      try {
        const out = await this._runWithRipgrep(type, query, fileTypes);
        if (out.trim().length) return out;
        return "No results.";
      } catch (_e) {
        // Fall through to next strategy
      }
    }

    // 2) Try find (+ grep for content)
    if (await this._hasCmd("find")) {
      try {
        const out = await this._runWithFind(type, query, fileTypes);
        if (out.trim().length) return out;
        return "No results.";
      } catch (_e) {
        // Fall through to next strategy
      }
    }

    // 3) Final fallback: Deno walker (portable)
    const out = await this._runWithDenoWalker(type, query, fileTypes);
    return out.trim().length ? out : "No results.";
  }

  // -----------------------------
  // Helpers
  // -----------------------------

  private async _hasCmd(cmd: string): Promise<boolean> {
    try {
      const p = new Deno.Command(cmd, {
        args: ["--version"],
        stdout: "null",
        stderr: "null",
      });
      const r = await p.output();
      return r.code === 0;
    } catch {
      return false;
    }
  }

  // Build ripgrep glob flags: supports multiple --iglob
  private _rgGlobFlags(queryGlob: string, fileTypes: string[]) {
    const flags: string[] = [];
    // primary glob from the LLM
    if (queryGlob && queryGlob !== "") {
      // Use --iglob to be case-insensitive on names
      flags.push("--iglob", queryGlob);
    }
    // extension filters
    for (const ext of fileTypes) {
      const clean = ext.replace(/^\./, "");
      flags.push("--iglob", `**/*.${clean}`);
    }
    return flags;
  }

  private async _runWithRipgrep(
    type: "filename" | "content",
    query: string,
    fileTypes: string[],
  ): Promise<string> {
    if (type === "filename") {
      // We list files and constrain with globs.
      const args = [
        "--files",
        "--hidden",
        "--color",
        "never",
        ...this._rgGlobFlags(query, fileTypes),
      ];
      const { code, stdout, stderr } = await new Deno.Command("rg", {
        args,
        stdout: "piped",
        stderr: "piped",
      }).output();

      if (code !== 0) throw new Error(new TextDecoder().decode(stderr));
      return new TextDecoder().decode(stdout);
    } else {
      // Content search
      const args = [
        "--line-number",
        "--no-heading",
        "--color",
        "never",
        "--max-columns",
        "300",
        ...this._rgGlobFlags("*", fileTypes), // apply only extension filters here
        query, // ripgrep pattern (regex by default)
      ];
      const { code, stdout, stderr } = await new Deno.Command("rg", {
        args,
        stdout: "piped",
        stderr: "piped",
      }).output();

      if (code !== 0 && stdout.length === 0) {
        // rg returns non-zero when no matches; treat as "no results" unless it's a real error
        const err = new TextDecoder().decode(stderr);
        if (/regex parse|error/i.test(err)) throw new Error(err);
        return "";
      }
      return new TextDecoder().decode(stdout);
    }
  }

  // Convert LLM glob → find predicates
  // - For filename search, prefer -name (basename). If glob includes a slash, use -path.
  // - For extension filters, build (-name "*.ts" -o -name "*.tsx") group.
  private _buildFindPredicatesForNames(glob: string, exts: string[]): string[] {
    const preds: string[] = ["-type", "f"];
    const hasSlash = glob.includes("/");
    const pat = glob.replace(/^(\.\/)+/, ""); // normalize leading ./ if any

    if (glob && glob !== "" && glob !== "*") {
      if (hasSlash) {
        preds.push("-path", pat);
      } else {
        // basename pattern
        preds.push("-name", pat);
      }
    }

    if (exts.length > 0) {
      // add extension OR-group
      const group: string[] = ["\\("];
      exts.forEach((ext, i) => {
        const clean = ext.replace(/^\./, "");
        if (i > 0) group.push("-o");
        group.push("-name", `*.${clean}`);
      });
      group.push("\\)");
      preds.push("-a", ...group);
    }
    return preds;
  }

  private async _runWithFind(
    type: "filename" | "content",
    query: string,
    fileTypes: string[],
  ): Promise<string> {
    if (type === "filename") {
      const preds = this._buildFindPredicatesForNames(query, fileTypes);
      const args = ["."].concat(preds).concat(["-print"]);
      const { code, stdout, stderr } = await new Deno.Command("find", {
        args,
        stdout: "piped",
        stderr: "piped",
      }).output();
      if (code !== 0) throw new Error(new TextDecoder().decode(stderr));
      return new TextDecoder().decode(stdout);
    } else {
      // content search needs grep; if no grep, we’ll fall back to walker
      const hasGrep = await this._hasCmd("grep");
      if (!hasGrep) return ""; // trigger Deno walker fallback

      // 1) Build find to select files
      const filePreds = this._buildFindPredicatesForNames("*", fileTypes);
      const findArgs = ["."].concat(filePreds).concat(["-print0"]);

      const findRes = await new Deno.Command("find", {
        args: findArgs,
        stdout: "piped",
        stderr: "piped",
      }).output();
      if (findRes.code !== 0) {
        const err = new TextDecoder().decode(findRes.stderr);
        throw new Error(err);
      }
      const filesBuf = new TextDecoder().decode(findRes.stdout);
      const files = filesBuf ? filesBuf.split("\0").filter(Boolean) : [];

      if (files.length === 0) return "";

      // 2) Run grep on chunks to avoid "arg list too long"
      const chunks: string[] = [];
      const batchSize = 300; // conservative
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        const { code, stdout /*, stderr*/ } = await new Deno.Command("grep", {
          args: ["-nH", "--color=never", "-E", query, ...batch],
          stdout: "piped",
          stderr: "piped",
        }).output();

        // grep returns non-zero when no matches in a batch; that's not fatal
        if (stdout.length > 0) {
          chunks.push(new TextDecoder().decode(stdout));
        }
      }
      return chunks.join("");
    }
  }

  private async _runWithDenoWalker(
    type: "filename" | "content",
    query: string,
    fileTypes: string[],
  ): Promise<string> {
    // Minimal, dependency-free fallback:
    // - For filename: test globs with URLPattern-like conversion to RegExp.
    // - For content: read text files and regex match (UTF-8 only, small files).
    // NOTE: This is intentionally simple; rg/find are preferred for big repos.

    const toRegexFromGlob = (glob: string) => {
      // Very small glob -> regex converter: supports **, *, ?, and .
      // Not 100% POSIX, but good enough as a fallback.
      let g = glob;
      g = g.replace(/[.+^${}()|[\]\\]/g, "\\$&"); // escape regex specials
      g = g.replace(/\*\*/g, "<<<GLOBSTAR>>>"); // temp token
      g = g.replace(/\*/g, "[^/]*");
      g = g.replace(/\?/g, "[^/]");
      g = g.replace(/<<<GLOBSTAR>>>/g, ".*");
      return new RegExp("^" + g + "$", "i");
    };

    const nameRegex = toRegexFromGlob(query || "*");
    const extSet = new Set(
      fileTypes.map((e) => e.replace(/^\./, "").toLowerCase()),
    );

    const matches: string[] = [];
    for await (const entry of Deno.readDir(".")) {
      // depth-first walk
      await this._walk(".", entry, async (path: string, isFile: boolean) => {
        if (!isFile) return;

        const okExt =
          extSet.size === 0
            ? true
            : (() => {
                const dot = path.lastIndexOf(".");
                if (dot === -1) return false;
                const ext = path.slice(dot + 1).toLowerCase();
                return extSet.has(ext);
              })();

        if (!okExt) return;

        if (type === "filename") {
          const base = path.split("/").pop() ?? path;
          if (nameRegex.test(query.includes("/") ? path : base)) {
            matches.push(path);
          }
        } else {
          // content search (regex by default)
          try {
            const data = await Deno.readTextFile(path);
            const rx = new RegExp(query, "m");
            if (rx.test(data)) {
              // include line numbers for context (first match only to keep it light)
              const lines = data.split(/\r?\n/);
              for (let i = 0; i < lines.length; i++) {
                if (rx.test(lines[i])) {
                  matches.push(`${path}:${i + 1}:${lines[i]}`);
                  break;
                }
              }
            }
          } catch {
            // skip binary/permission errors
          }
        }
      });
    }
    return matches.join("\n");
  }

  private async _walk(
    root: string,
    entry: Deno.DirEntry,
    cb: (path: string, isFile: boolean) => Promise<void>,
    rel: string = "",
  ): Promise<void> {
    const full = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isFile) {
      await cb(full, true);
    } else if (entry.isDirectory) {
      // skip common ignored dirs (fallback only)
      if (entry.name === ".git" || entry.name === "node_modules") return;
      for await (const child of Deno.readDir(full)) {
        await this._walk(full, child, cb, full);
      }
    }
  }

  // -----------------------------
  // New Project Analysis Methods
  // -----------------------------

  private async loadGitignore(): Promise<void> {
    this.gitignorePatterns = [];

    try {
      const gitignoreContent = await Deno.readTextFile(".gitignore");
      this.gitignorePatterns = gitignoreContent
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((pattern) => this.globToRegex(pattern));
    } catch {
      // No .gitignore file, use minimal defaults
      this.gitignorePatterns = [
        this.globToRegex(".git/"),
        this.globToRegex("node_modules/"),
      ];
    }
  }

  private globToRegex(pattern: string): string {
    // Simple glob to regex conversion
    let regex = pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&") // escape regex specials
      .replace(/\*/g, "[^/]*") // * matches anything except /
      .replace(/\?/g, "[^/]") // ? matches single char except /
      .replace(/\\\*\\\*/g, ".*"); // ** matches anything including /

    // Handle directory patterns
    if (pattern.endsWith("/")) {
      regex = regex.slice(0, -1) + "(/.*)?$";
    } else {
      regex = "^" + regex + "$";
    }

    return regex;
  }

  private isIgnored(path: string): boolean {
    return this.gitignorePatterns.some((pattern) => {
      const regex = new RegExp(pattern);
      return regex.test(path) || regex.test(path + "/");
    });
  }

  private async getProjectOverview(): Promise<string> {
    await this.loadGitignore();

    const fileTree: string[] = [];
    const textFiles: Array<{ path: string; size: number; ext: string }> = [];
    const languages: { [ext: string]: number } = {};
    let totalSize = 0;

    await this.walkDirectoryForAnalysis(
      ".",
      fileTree,
      textFiles,
      languages,
      totalSize,
    );

    return this.formatProjectOverview(
      fileTree,
      textFiles,
      languages,
      totalSize,
    );
  }

  private async getFileTree(): Promise<string> {
    await this.loadGitignore();
    const fileTree: string[] = [];

    await this.walkDirectorySimple(".", fileTree);

    return `# Project File Tree\n\n\`\`\`\n${fileTree.join("\n")}\n\`\`\``;
  }

  private async readSelectedFiles(files: string[]): Promise<string> {
    if (files.length === 0) {
      return "No files specified for reading.";
    }

    let result = `# Selected Files Analysis\n\n`;

    for (const file of files) {
      try {
        const stat = await Deno.stat(file);
        const content = await this.readFileWithSampling(file, stat.size);
        result += `## ${file}\n\n`;
        result += `**Size:** ${stat.size} bytes\n\n`;
        result += `\`\`\`\n${content}\n\`\`\`\n\n`;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result += `## ${file}\n\nError reading file: ${errorMsg}\n\n`;
      }
    }

    return result;
  }

  private async walkDirectoryForAnalysis(
    dir: string,
    fileTree: string[],
    textFiles: Array<{ path: string; size: number; ext: string }>,
    languages: { [ext: string]: number },
    totalSize: number,
    depth = 0,
  ): Promise<void> {
    if (depth > 10) return; // Prevent infinite recursion

    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = dir === "." ? entry.name : `${dir}/${entry.name}`;

        // Skip files/dirs based on .gitignore
        if (this.isIgnored(fullPath)) {
          continue;
        }

        const indent = "  ".repeat(depth);
        fileTree.push(`${indent}${entry.name}${entry.isDirectory ? "/" : ""}`);

        if (entry.isFile) {
          const stat = await Deno.stat(fullPath);
          const extension = this.getFileExtension(entry.name);

          if (this.isTextFile(entry.name, stat.size)) {
            textFiles.push({
              path: fullPath,
              size: stat.size,
              ext: extension,
            });
            languages[extension] = (languages[extension] || 0) + 1;
            totalSize += stat.size;
          }
        } else if (entry.isDirectory) {
          await this.walkDirectoryForAnalysis(
            fullPath,
            fileTree,
            textFiles,
            languages,
            totalSize,
            depth + 1,
          );
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  private async walkDirectorySimple(
    dir: string,
    fileTree: string[],
    depth = 0,
  ): Promise<void> {
    if (depth > 10) return;

    try {
      for await (const entry of Deno.readDir(dir)) {
        const fullPath = dir === "." ? entry.name : `${dir}/${entry.name}`;

        if (this.isIgnored(fullPath)) {
          continue;
        }

        const indent = "  ".repeat(depth);
        fileTree.push(`${indent}${entry.name}${entry.isDirectory ? "/" : ""}`);

        if (entry.isDirectory) {
          await this.walkDirectorySimple(fullPath, fileTree, depth + 1);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot > 0 ? filename.slice(lastDot + 1).toLowerCase() : "";
  }

  private isTextFile(filename: string, size: number): boolean {
    // Skip very large files (> 10MB)
    if (size > 10 * 1024 * 1024) return false;

    const ext = this.getFileExtension(filename);

    // Binary/media extensions to skip
    const binaryExts = new Set([
      // Images
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "ico",
      "webp",
      // Videos
      "mp4",
      "avi",
      "mov",
      "wmv",
      "flv",
      "webm",
      "mkv",
      // Audio
      "mp3",
      "wav",
      "flac",
      "aac",
      "ogg",
      "wma",
      // Documents
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      // Archives
      "zip",
      "tar",
      "gz",
      "rar",
      "7z",
      "bz2",
      "xz",
      // Executables
      "exe",
      "dll",
      "so",
      "dylib",
      "app",
      "deb",
      "rpm",
      // Fonts
      "ttf",
      "otf",
      "woff",
      "woff2",
      "eot",
      // Other binary
      "bin",
      "dat",
      "db",
      "sqlite",
      "sqlite3",
    ]);

    if (binaryExts.has(ext)) return false;

    // Common text extensions
    const textExts = new Set([
      "txt",
      "md",
      "rst",
      "log",
      "cfg",
      "conf",
      "ini",
      "yml",
      "yaml",
      "toml",
      "js",
      "ts",
      "jsx",
      "tsx",
      "json",
      "html",
      "htm",
      "css",
      "scss",
      "sass",
      "py",
      "rb",
      "php",
      "java",
      "c",
      "cpp",
      "cc",
      "cxx",
      "h",
      "hpp",
      "rs",
      "go",
      "sh",
      "bash",
      "zsh",
      "fish",
      "ps1",
      "bat",
      "cmd",
      "xml",
      "svg",
      "csv",
      "sql",
      "dockerfile",
      "makefile",
    ]);

    if (textExts.has(ext)) return true;

    // Files without extensions - check if they might be text (config files, etc.)
    if (!ext) {
      const textFilenames = new Set([
        "readme",
        "license",
        "changelog",
        "makefile",
        "dockerfile",
        "procfile",
        "gitignore",
        "gitattributes",
        "editorconfig",
        "npmignore",
      ]);
      return textFilenames.has(filename.toLowerCase());
    }

    return false;
  }

  private formatProjectOverview(
    fileTree: string[],
    textFiles: Array<{ path: string; size: number; ext: string }>,
    languages: { [ext: string]: number },
    totalSize: number,
  ): string {
    let result = `# Project Overview\n\n`;
    result += `**Stats:** ${textFiles.length} text files, ${Math.round(totalSize / 1024)}KB total\n\n`;

    // Language breakdown
    if (Object.keys(languages).length > 0) {
      result += `**Languages detected:**\n`;
      const sorted = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      for (const [ext, count] of sorted) {
        result += `- ${ext || "no-ext"}: ${count} files\n`;
      }
      result += `\n`;
    }

    // File tree (truncated if too large)
    result += `**Project Structure:**\n\`\`\`\n`;
    const maxTreeLines = 100;
    if (fileTree.length > maxTreeLines) {
      result += fileTree.slice(0, maxTreeLines).join("\n");
      result += `\n... (${fileTree.length - maxTreeLines} more items)\n`;
    } else {
      result += fileTree.join("\n");
    }
    result += `\n\`\`\`\n\n`;

    // Most important looking files for LLM to consider
    result += `**Text files available for analysis:** ${textFiles.length} files\n`;

    return result;
  }

  private async readFileWithSampling(
    file: string,
    size: number,
  ): Promise<string> {
    // For small files, read completely
    if (size < 10000) {
      return await Deno.readTextFile(file);
    }

    // For large files, sample strategically
    const content = await Deno.readTextFile(file);
    const lines = content.split("\n");

    if (lines.length <= 200) {
      return content;
    }

    // Sample: first 100 lines + last 50 lines
    let sampled: string[] = [];

    sampled.push("// --- START OF FILE ---");
    sampled.push(...lines.slice(0, 100));

    if (lines.length > 150) {
      sampled.push(`\n// --- SKIPPED ${lines.length - 150} LINES ---\n`);
      sampled.push(...lines.slice(-50));
    }

    return sampled.join("\n");
  }
}
