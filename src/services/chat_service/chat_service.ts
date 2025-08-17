import { join } from "@std/path";
import { exists, ensureDir } from "@std/fs";
import { envInTestMode, getHomeDir } from "#shared/utils/utils.ts";
import { Config } from "./chat_service_types.ts";

export class ChatService {
  public marsDirName: string;
  public marsDir: string;
  public chatsDir: string;
  public configPath: string;
  public backupsDir: string;

  constructor() {
    const homeDir = getHomeDir();

    this.marsDirName = ".mars-new"; // TODO: change to .mars
    this.marsDir = join(homeDir, this.marsDirName);
    this.chatsDir = join(this.marsDir, "chats");
    this.configPath = join(this.marsDir, "config.json");
    this.backupsDir = join(this.marsDir, "backups");
  }

  async initialize(): Promise<void> {
    await ensureDir(this.chatsDir);
    await ensureDir(this.backupsDir);

    if (!(await exists(this.configPath))) {
      this.createDefaultConfig();
    }
  }

  async createDefaultConfig() {
    const defaultConfig: Config = {
      currentModel: "claude4-sonnet",
      lastUsedChat: null,
      defaultModel: "claude4-sonnet",
    };
    await this.saveConfig(defaultConfig);
  }

  async loadConfig(): Promise<Config> {
    try {
      const configText = await Deno.readTextFile(this.configPath);
      return JSON.parse(configText);
    } catch {
      // return default config if file doesn't exist or is corrupted
      return {
        currentModel: "claude4-sonnet",
        lastUsedChat: null,
        defaultModel: "claude4-sonnet",
      };
    }
  }

  async saveConfig(config: Config): Promise<void> {
    await Deno.writeTextFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async cleanup(): Promise<void> {
    if (!envInTestMode()) {
      throw new Error("Cannot run cleanup method if not in test mode");
    }

    try {
      if (await exists(this.marsDir)) {
        await Deno.remove(this.marsDir, { recursive: true });
      }
    } catch {
      // Directory might not exist or already cleaned up
    }
  }
}
