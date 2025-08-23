import { join } from "@std/path";
import { exists, ensureDir } from "@std/fs";
import { envInTestMode, getHomeDir } from "#shared/utils/utils.ts";
import { Config } from "./chat_service_types.ts";
import { chatServiceMessages } from "./chat_service_messages.ts";
import { findModelById } from "#llm/llm.ts";

export const defaultAssistantModelId = "claude-sonnet-4-20250514";
export const defaultAssistantModelName = "Claude Sonnet 4";
export const defaultAssistantProviderId = "anthropic";

export class ChatService {
  private static instance: ChatService;

  marsDirName: string;
  marsDir: string;
  chatsDir: string;
  configPath: string;
  backupsDir: string;

  private constructor() {
    const homeDir = getHomeDir();

    this.marsDirName = ".mars-new"; // TODO: change to .mars
    this.marsDir = join(homeDir, this.marsDirName);
    this.chatsDir = join(this.marsDir, "chats");
    this.configPath = join(this.marsDir, "config.json");
    this.backupsDir = join(this.marsDir, "backups");
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }

    return ChatService.instance;
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
      currentProviderId: defaultAssistantProviderId,
      currentModel: findModelById({
        providerId: defaultAssistantProviderId,
        modelId: defaultAssistantModelId,
      }),
      defaultProviderId: defaultAssistantProviderId,
      defaultModel: findModelById({
        providerId: defaultAssistantProviderId,
        modelId: defaultAssistantModelId,
      }),
      lastUsedChat: null,
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
        currentProviderId: defaultAssistantProviderId,
        currentModel: findModelById({
          providerId: defaultAssistantProviderId,
          modelId: defaultAssistantModelId,
        }),
        defaultProviderId: defaultAssistantProviderId,
        defaultModel: findModelById({
          providerId: defaultAssistantProviderId,
          modelId: defaultAssistantModelId,
        }),
        lastUsedChat: null,
      };
    }
  }

  async saveConfig(config: Config): Promise<void> {
    await Deno.writeTextFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async cleanup(): Promise<void> {
    if (!envInTestMode()) {
      throw new TypeError(chatServiceMessages.error.cleanup_not_in_test_mode());
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
