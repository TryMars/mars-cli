export const envInTestMode = (): boolean => {
  return Deno.env.get("APP_MODE") === "test";
};
