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

export const formatCentsForDisplay = (cents: number): string => {
  const dollars = cents / 100;

  if (dollars > 0 && dollars < 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(dollars);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dollars);
};
