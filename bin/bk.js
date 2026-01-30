#!/usr/bin/env node

/**
 * BrseKit CLI entry point
 * Wrapper script that runs the compiled TypeScript CLI
 */

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

// Minimum required Node.js version
const MIN_NODE_VERSION = [18, 0];

/**
 * Check if current Node.js version meets minimum requirements
 */
const checkNodeVersion = () => {
  const [major, minor] = process.versions.node.split(".").map(Number);
  const [minMajor, minMinor] = MIN_NODE_VERSION;

  if (major < minMajor || (major === minMajor && minor < minMinor)) {
    console.error(
      `Error: Node.js ${MIN_NODE_VERSION.join(".")}+ is required. Current: ${process.versions.node}`
    );
    console.error("Please upgrade Node.js: https://nodejs.org/");
    process.exit(1);
  }
};

checkNodeVersion();

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, "..", "dist", "index.js");

if (!existsSync(distPath)) {
  console.error("Error: Compiled distribution not found.");
  console.error("Run 'npm run build' first, or use 'npm run dev' for development.");
  process.exit(1);
}

// Convert to file:// URL for cross-platform ESM compatibility (Windows paths require this)
const distUrl = pathToFileURL(distPath).href;

// Import and run the CLI
await import(distUrl);
