export const llmMessages = {
  error: {
    provider_not_found: (providerId: string) =>
      `The provider you are searching for cannot be found: ${providerId}`,

    model_not_found: (modelId: string) =>
      `The model you are searching for cannot be found: ${modelId}`,

    tool_not_found: (toolName: string) =>
      `The tool you are requesting cannot be found: ${toolName}`,

    cleanup_not_in_test_mode: () =>
      "Cannot run cleanup method if not in test mode",
  },
};
