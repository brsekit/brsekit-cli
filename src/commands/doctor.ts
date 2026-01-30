/**
 * Doctor command - Health check for BrseKit installation
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import pc from "picocolors";
import { logger } from "../shared/logger.js";

interface DoctorOptions {
  fix?: boolean;
  verbose?: boolean;
}

interface CheckResult {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  fix?: () => Promise<void>;
}

/**
 * Check if a command exists
 */
function commandExists(cmd: string): boolean {
  try {
    execSync(`${process.platform === "win32" ? "where" : "which"} ${cmd}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check GitHub CLI authentication
 */
async function checkGhAuth(): Promise<CheckResult> {
  if (!commandExists("gh")) {
    return {
      name: "GitHub CLI",
      status: "fail",
      message: "GitHub CLI (gh) not installed",
    };
  }

  try {
    execSync("gh auth status", { stdio: "ignore" });
    return {
      name: "GitHub CLI",
      status: "pass",
      message: "Authenticated with GitHub",
    };
  } catch {
    return {
      name: "GitHub CLI",
      status: "fail",
      message: "Not authenticated. Run: gh auth login",
    };
  }
}

/**
 * Check Python environment
 */
async function checkPython(): Promise<CheckResult> {
  const pythonCmd = process.platform === "win32" ? "python" : "python3";

  if (!commandExists(pythonCmd)) {
    return {
      name: "Python",
      status: "fail",
      message: "Python not found",
    };
  }

  try {
    const version = execSync(`${pythonCmd} --version`, { encoding: "utf-8" }).trim();
    return {
      name: "Python",
      status: "pass",
      message: version,
    };
  } catch {
    return {
      name: "Python",
      status: "fail",
      message: "Python not working properly",
    };
  }
}

/**
 * Check Node.js version
 */
async function checkNode(): Promise<CheckResult> {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0], 10);

  if (major < 18) {
    return {
      name: "Node.js",
      status: "fail",
      message: `Node.js 18+ required. Current: ${version}`,
    };
  }

  return {
    name: "Node.js",
    status: "pass",
    message: `Node.js ${version}`,
  };
}

/**
 * Check BrseKit installation
 */
async function checkInstallation(): Promise<CheckResult> {
  const localSkillsDir = join(process.cwd(), ".claude", "skills");
  const metadataPath = join(localSkillsDir, "metadata.json");

  if (existsSync(metadataPath)) {
    return {
      name: "BrseKit (local)",
      status: "pass",
      message: "Installed in current project",
    };
  }

  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const globalSkillsDir = join(homeDir, ".claude", "skills");
  const globalMetadataPath = join(globalSkillsDir, "metadata.json");

  if (existsSync(globalMetadataPath)) {
    return {
      name: "BrseKit (global)",
      status: "pass",
      message: "Installed globally",
    };
  }

  return {
    name: "BrseKit",
    status: "warn",
    message: "Not installed. Run: bk init",
  };
}

/**
 * Check environment variables
 */
async function checkEnvVars(): Promise<CheckResult> {
  const required = ["BACKLOG_SPACE_URL", "BACKLOG_API_KEY", "BACKLOG_PROJECT_KEY"];
  const missing: string[] = [];

  // Check process.env and .env file
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length === 0) {
    return {
      name: "Environment",
      status: "pass",
      message: "All required variables set",
    };
  }

  if (missing.length === required.length) {
    return {
      name: "Environment",
      status: "warn",
      message: "Missing: " + missing.join(", "),
    };
  }

  return {
    name: "Environment",
    status: "warn",
    message: "Missing: " + missing.join(", "),
  };
}

/**
 * Print check result
 */
function printResult(result: CheckResult): void {
  const icon =
    result.status === "pass"
      ? pc.green("✓")
      : result.status === "warn"
        ? pc.yellow("!")
        : pc.red("✗");

  const statusColor =
    result.status === "pass"
      ? pc.green
      : result.status === "warn"
        ? pc.yellow
        : pc.red;

  console.log(`  ${icon} ${pc.bold(result.name)}: ${statusColor(result.message)}`);
}

/**
 * Doctor command handler
 */
export async function doctorCommand(options: DoctorOptions): Promise<void> {
  if (options.verbose) {
    logger.setVerbose(true);
  }

  console.log();
  console.log(pc.bold("BrseKit Health Check"));
  console.log();

  const checks = [
    checkNode,
    checkPython,
    checkGhAuth,
    checkInstallation,
    checkEnvVars,
  ];

  const results: CheckResult[] = [];
  let hasFailures = false;

  for (const check of checks) {
    const result = await check();
    results.push(result);
    printResult(result);
    if (result.status === "fail") {
      hasFailures = true;
    }
  }

  console.log();

  if (hasFailures) {
    console.log(pc.red("Some checks failed. Please fix the issues above."));
    process.exitCode = 1;
  } else {
    console.log(pc.green("All checks passed!"));
  }

  console.log();
}
