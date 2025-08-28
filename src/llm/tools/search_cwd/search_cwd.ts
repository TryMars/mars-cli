import { BaseTool } from "#llm/tools/base_tool/base_tool.ts";
import { ToolConfigInputSchema } from "#llm/tools/tools_types.ts";
import { SearchCWDToolParams } from "./search_cwd_types.ts";

export class SearchCWD extends BaseTool<SearchCWDToolParams> {
  private static instance: SearchCWD | null;

  public name: string = "search_cwd";

  public description: string =
    "Search for files or content(s) within file(s) inside your current working directory.";

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
        enum: ["filename", "content"],
        description:
          "Whether to search for files by name (filename) or search within files (content).",
      },
      fileTypes: {
        type: "array",
        items: { type: "string" },
        description:
          "Optional list of file extensions (e.g., ['ts','tsx','js']) to restrict results.",
      },
    },
    required: ["query", "type"],
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
    const scope = params.type === "content" ? "content" : "files";

    return `Searching ${scope} in CWD for (“${params.query}”)`;
  }

  protected async getToolResponse(
    params: SearchCWDToolParams,
  ): Promise<string> {
    const { query, type, fileTypes = [] } = params;

    // 1) Try ripgrep
    if (await this._hasCmd("rg")) {
      try {
        const out = await this._runWithRipgrep(type, query, fileTypes);
        if (out.trim().length) return out;
        return "No results.";
      } catch (e) {
        // Fall through to next strategy
      }
    }

    // 2) Try find (+ grep for content)
    if (await this._hasCmd("find")) {
      try {
        const out = await this._runWithFind(type, query, fileTypes);
        if (out.trim().length) return out;
        return "No results.";
      } catch (e) {
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
}
