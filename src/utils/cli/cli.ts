/**
 * Parses command line flags from the provided arguments array.
 *
 * @param args - Array of command line arguments to parse
 * @returns Object containing parsed flag options
 */
export const parseCommandLineFlags = (args: Array<string>) => {
  // TODO: handle --help / -h with a helpful message

  const headlessMode = args.includes("--headless");

  return {
    headlessMode,
  };
};
