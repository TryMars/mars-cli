import { expect } from "@std/expect";
import { exists } from "@std/fs";
import { join } from "@std/path";
import {
  ChatService,
  defaultAssistantProviderId,
  defaultAssistantModelId,
  defaultAssistantModelName,
} from "./chat_service.ts";
import { describe, it } from "@std/testing/bdd";
import { getHomeDir } from "#shared/utils/utils.ts";
import { Config } from "./chat_service_types.ts";
import { chatServiceMessages } from "./chat_service_messages.ts";
import { stub } from "jsr:@std/testing/mock";

describe("chat service", () => {
  const chatService = ChatService.getInstance();

  it("initializes paths correctly", () => {
    const homeDir = getHomeDir();

    expect(chatService.moonlightDir).toBe(join(homeDir, chatService.moonlightDirName));
    expect(chatService.chatsDir).toBe(
      join(homeDir, chatService.moonlightDirName, "chats"),
    );
    expect(chatService.configPath).toBe(
      join(homeDir, chatService.moonlightDirName, "config.json"),
    );
    expect(chatService.backupsDir).toBe(
      join(homeDir, chatService.moonlightDirName, "backups"),
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

    expect(config.currentModel.id).toBe(defaultAssistantModelId);
    expect(config.currentModel.name).toBe(defaultAssistantModelName);

    expect(config.defaultModel.id).toBe(defaultAssistantModelId);
    expect(config.defaultModel.name).toBe(defaultAssistantModelName);

    expect(config.lastUsedChat).toBeNull();

    await chatService.cleanup();
  });

  it("returns default config when file doesn't exist", async () => {
    const config = await chatService.loadConfig();

    expect(config.currentModel.id).toBe(defaultAssistantModelId);
    expect(config.currentModel.name).toBe(defaultAssistantModelName);

    expect(config.defaultModel.id).toBe(defaultAssistantModelId);
    expect(config.defaultModel.name).toBe(defaultAssistantModelName);

    expect(config.lastUsedChat).toBeNull();
  });

  it("loads existing config correctly", async () => {
    await chatService.initialize();

    const testModel = {
      id: "test-model-12345",
      name: "Test Model",
    };

    const testConfig = {
      currentProviderId: defaultAssistantProviderId,
      currentModel: testModel,
      defaultProviderId: defaultAssistantProviderId,
      defaultModel: testModel,
      lastUsedChat: "test-chat",
    } as Config;

    await chatService.saveConfig(testConfig);
    const loadedConfig = await chatService.loadConfig();

    expect(loadedConfig).toEqual(testConfig);

    await chatService.cleanup();
  });

  it("cleanup removes moonlight directory", async () => {
    await chatService.initialize();

    expect(await exists(chatService.moonlightDir)).toBe(true);

    await chatService.cleanup();

    expect(await exists(chatService.moonlightDir)).toBe(false);
  });

  it("cleanup only works in test mode", async () => {
    // Mock APP_MODE to be production
    const envStub = stub(Deno.env, "get", (key: string) => {
      if (key === "APP_MODE") return "production";
      return Deno.env.get.call(Deno.env, key);
    });

    try {
      await expect(chatService.cleanup()).rejects.toThrow(
        chatServiceMessages.error.cleanup_not_in_test_mode(),
      );
    } finally {
      envStub.restore();
    }
  });
});
