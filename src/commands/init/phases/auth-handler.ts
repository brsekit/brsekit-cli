/**
 * Phase 2: Authentication handling
 */

import { execSync } from "node:child_process";
import * as p from "@clack/prompts";
import type { InitContext } from "../types.js";
import { logger } from "../../../shared/logger.js";

/**
 * Check if GitHub CLI is authenticated
 */
function isGhAuthenticated(): boolean {
  try {
    execSync("gh auth status", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if gh CLI is installed
 */
function isGhInstalled(): boolean {
  try {
    execSync(`${process.platform === "win32" ? "where" : "which"} gh`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get GitHub token from gh CLI
 */
export function getGhToken(): string | null {
  try {
    const token = execSync("gh auth token", { encoding: "utf-8" }).trim();
    return token || null;
  } catch {
    return null;
  }
}

/**
 * Handle authentication check and setup
 */
export async function handleAuth(ctx: InitContext): Promise<InitContext> {
  logger.verbose("Checking GitHub authentication");

  // Check environment variable first
  if (process.env.GITHUB_TOKEN) {
    logger.verbose("Using GITHUB_TOKEN from environment");
    return ctx;
  }

  // Check if gh CLI is installed
  if (!isGhInstalled()) {
    p.log.error("GitHub CLI (gh) is not installed.");
    p.log.info("Install it from: https://cli.github.com/");
    p.log.info("Or set GITHUB_TOKEN environment variable.");
    return { ...ctx, cancelled: true };
  }

  // Check if authenticated
  if (!isGhAuthenticated()) {
    p.log.warning("GitHub CLI is not authenticated.");
    p.log.info("Run: gh auth login");
    p.log.info("Select 'Login with a web browser' when prompted.");

    if (!ctx.isNonInteractive) {
      const shouldLogin = await p.confirm({
        message: "Would you like to run 'gh auth login' now?",
      });

      if (p.isCancel(shouldLogin)) {
        return { ...ctx, cancelled: true };
      }

      if (shouldLogin) {
        p.log.info("Opening GitHub authentication...");
        try {
          execSync("gh auth login", { stdio: "inherit" });
        } catch {
          p.log.error("Authentication failed.");
          return { ...ctx, cancelled: true };
        }
      } else {
        return { ...ctx, cancelled: true };
      }
    } else {
      return { ...ctx, cancelled: true };
    }
  }

  logger.verbose("GitHub authentication verified");
  return ctx;
}
