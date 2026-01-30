#!/usr/bin/env node

/**
 * BrseKit CLI - Main entry point
 * CLI tool for bootstrapping and updating BrseKit projects
 */

import { cac } from "cac";
import { registerCommands } from "./cli/command-registry.js";
import { logger } from "./shared/logger.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Get package version
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = join(__dirname, "..", "package.json");
let version = "1.0.0";
try {
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
  version = pkg.version;
} catch {
  // Use default version
}

// Create CLI instance
const cli = cac("bk");

// Register commands
registerCommands(cli);

// Global options
cli.option("-v, --verbose", "Enable verbose output");

// Help and version
cli.help();
cli.version(version);

// Parse and run
const parsed = cli.parse(process.argv, { run: false });

// Handle verbose flag globally
if (parsed.options.verbose) {
  logger.setVerbose(true);
  logger.verbose("Verbose mode enabled");
}

// Run matched command
try {
  await cli.runMatchedCommand();
} catch (error) {
  if (error instanceof Error) {
    logger.error(error.message);
    if (parsed.options.verbose) {
      console.error(error.stack);
    }
  } else {
    logger.error("An unknown error occurred");
  }
  process.exit(1);
}
