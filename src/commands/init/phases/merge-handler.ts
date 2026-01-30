/**
 * Phase 5: Merge files to target directory
 */

import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import fse from "fs-extra";
import type { InitContext } from "../types.js";
import { logger } from "../../../shared/logger.js";
import { PROTECTED_PATTERNS } from "../../../shared/constants.js";

/**
 * Check if path matches any protected pattern
 */
function isProtected(relativePath: string): boolean {
  const normalizedPath = relativePath.replace(/\\/g, "/");

  for (const pattern of PROTECTED_PATTERNS) {
    // Simple glob matching
    if (pattern.includes("**")) {
      const prefix = pattern.replace("/**", "");
      if (normalizedPath.startsWith(prefix)) {
        return true;
      }
    } else if (pattern.includes("*")) {
      const regex = new RegExp(
        "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
      );
      if (regex.test(normalizedPath)) {
        return true;
      }
    } else if (normalizedPath === pattern) {
      return true;
    }
  }

  return false;
}

/**
 * Copy directory recursively, respecting protected patterns
 */
async function copyDirectory(
  src: string,
  dest: string,
  stats: { copied: number; skipped: number }
): Promise<void> {
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    const relativePath = relative(src, srcPath);

    if (isProtected(relativePath)) {
      logger.verbose(`Skipping protected: ${relativePath}`);
      stats.skipped++;
      continue;
    }

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath, stats);
    } else {
      // Check if destination exists and is protected
      if (existsSync(destPath) && isProtected(entry.name)) {
        logger.verbose(`Preserving existing: ${relativePath}`);
        stats.skipped++;
        continue;
      }

      copyFileSync(srcPath, destPath);
      stats.copied++;
    }
  }
}

/**
 * Handle file merge
 */
export async function handleMerge(ctx: InitContext): Promise<InitContext> {
  if (!ctx.extractDir) {
    p.log.error("No extracted directory available.");
    return { ...ctx, cancelled: true };
  }

  logger.verbose("Starting merge", {
    from: ctx.extractDir,
    to: ctx.skillsDir,
  });

  const spinner = p.spinner();
  spinner.start("Installing files...");

  try {
    // Handle fresh install
    if (ctx.options.fresh && existsSync(ctx.skillsDir)) {
      spinner.message("Removing existing installation...");
      rmSync(ctx.skillsDir, { recursive: true, force: true });
    }

    // Ensure target directory exists
    mkdirSync(ctx.skillsDir, { recursive: true });

    // Copy files
    const stats = { copied: 0, skipped: 0 };
    await copyDirectory(ctx.extractDir, ctx.skillsDir, stats);

    // Write metadata
    const metadata = {
      version: ctx.selectedVersion,
      installedAt: new Date().toISOString(),
      source: "brsekit-cli",
    };

    await fse.writeJson(join(ctx.skillsDir, "metadata.json"), metadata, {
      spaces: 2,
    });

    spinner.stop(`Installed ${stats.copied} files (${stats.skipped} protected)`);

    // Cleanup temp directory
    if (ctx.tempDir) {
      rmSync(ctx.tempDir, { recursive: true, force: true });
    }

    return ctx;
  } catch (error) {
    spinner.stop("Installation failed");
    if (error instanceof Error) {
      p.log.error(error.message);
    }
    return { ...ctx, cancelled: true };
  }
}
