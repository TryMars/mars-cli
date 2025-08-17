import { expect } from "@std/expect";
import { exists } from "@std/fs";
import { join } from "@std/path";
import { ChatService } from "./chat_service.ts";
import { describe, it } from "@std/testing/bdd";
import { getHomeDir } from "#shared/utils/utils.ts";

describe("chat service", () => {
  const chatService = new ChatService();

  it("initializes paths correctly", () => {
    const homeDir = getHomeDir();

    expect(chatService.marsDir).toBe(join(homeDir, chatService.marsDirName));
    expect(chatService.chatsDir).toBe(
      join(homeDir, chatService.marsDirName, "chats"),
    );
    expect(chatService.configPath).toBe(
      join(homeDir, chatService.marsDirName, "config.json"),
    );
    expect(chatService.backupsDir).toBe(
      join(homeDir, chatService.marsDirName, "backups"),
    );
  });

  it("creates required directories on initialize", async () => {
    await chatService.initialize();

    expect(await exists(chatService.chatsDir)).toBe(true);
    expect(await exists(chatService.backupsDir)).toBe(true);

    await chatService.cleanup();
  });

  it("creates default config with correct values", async () => {
    await chatService.initialize();

    const config = await chatService.loadConfig();

    expect(config.currentModel).toBe("claude4-sonnet");
    expect(config.defaultModel).toBe("claude4-sonnet");
    expect(config.lastUsedChat).toBeNull();

    await chatService.cleanup();
  });

  it("returns default config when file doesn't exist", async () => {
    const config = await chatService.loadConfig();

    expect(config.currentModel).toBe("claude4-sonnet");
    expect(config.defaultModel).toBe("claude4-sonnet");
    expect(config.lastUsedChat).toBeNull();
  });

  it("loads existing config correctly", async () => {
    await chatService.initialize();

    const testConfig = {
      currentModel: "test-model",
      defaultModel: "default-model",
      lastUsedChat: "test-chat",
    };

    await chatService.saveConfig(testConfig);
    const loadedConfig = await chatService.loadConfig();

    expect(loadedConfig).toEqual(testConfig);

    await chatService.cleanup();
  });

  it("cleanup removes mars directory", async () => {
    await chatService.initialize();

    expect(await exists(chatService.marsDir)).toBe(true);

    await chatService.cleanup();

    expect(await exists(chatService.marsDir)).toBe(false);
  });

  it("cleanup only works in test mode", async () => {
    Deno.env.set("APP_MODE", "production");

    await expect(chatService.cleanup()).rejects.toThrow();
  });
});
