/**
 * Parses command line flags from the provided arguments array
 * and returns only supported arguments.
 */
export const parseCommandLineFlags = (args: Array<string>) => {
  // TODO: handle --help / -h with a helpful message

  const headlessMode = args.includes("--headless");

  return {
    headlessMode,
  };
};
