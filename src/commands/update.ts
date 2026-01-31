/**
 * Update command - shortcut for updating BrseKit to latest version
 * Checks if BrseKit is already installed, then runs init with latest
 */

import * as p from "@clack/prompts";
import fs from "fs-extra";
import path from "path";
import { initCommand } from "./init/init-command.js";
import { logger } from "../shared/logger.js";

export interface UpdateOptions {
  dir?: string;
  release?: string;
  verbose?: boolean;
  yes?: boolean;
  beta?: boolean;
  fresh?: boolean;
}

/**
 * Check if BrseKit is installed in the target directory
 */
function isBrseKitInstalled(targetDir: string): boolean {
  const skillsDir = path.join(targetDir, ".claude", "skills");
  const brseKitMarkers = [
    path.join(skillsDir, "brsekit"),
    path.join(skillsDir, "bk-track"),
    path.join(skillsDir, "bk-recall"),
  ];

  return brseKitMarkers.some((marker) => fs.existsSync(marker));
}

/**
 * Main update command handler
 */
export async function updateCommand(options: UpdateOptions): Promise<void> {
  if (options.verbose) {
    logger.setVerbose(true);
  }

  const targetDir = options.dir || process.cwd();

  // Check if BrseKit is already installed
  if (!isBrseKitInstalled(targetDir)) {
    p.log.error(
      "BrseKit is not installed in this directory. Use 'bk init' first."
    );
    process.exitCode = 1;
    return;
  }

  p.log.info("Updating BrseKit to latest version...");

  // Run init with update-focused options
  await initCommand({
    dir: options.dir,
    release: options.release || "latest",
    verbose: options.verbose,
    yes: options.yes,
    beta: options.beta,
    global: false,
    fresh: options.fresh || false,
  });
}
