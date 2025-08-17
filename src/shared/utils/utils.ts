import { join } from "@std/path";

export const envInTestMode = (): boolean => {
  return Deno.env.get("APP_MODE") === "test";
};

export const getHomeDir = (): string => {
  if (envInTestMode()) {
    return join(Deno.cwd(), "tests", "storage");
  }

  return Deno.env.get("HOME") as string;
};
