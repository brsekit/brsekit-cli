/**
 * Phase 6: Post-installation tasks
 */

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import * as p from "@clack/prompts";
import type { InitContext } from "../types.js";
import { logger } from "../../../shared/logger.js";

/**
 * Run install script if exists
 * @param skillsDir - Path to skills directory
 * @param autoConfirm - If true, pass -Y/-y flag to skip prompts
 */
async function runInstallScript(
  skillsDir: string,
  autoConfirm: boolean = false
): Promise<boolean> {
  const isWindows = process.platform === "win32";
  const scriptName = isWindows ? "install.ps1" : "install.sh";
  const scriptPath = join(skillsDir, scriptName);

  if (!existsSync(scriptPath)) {
    logger.verbose("No install script found");
    return true;
  }

  logger.verbose(`Running ${scriptName}${autoConfirm ? " (auto-confirm)" : ""}`);

  try {
    if (isWindows) {
      // -Y flag skips all prompts in install.ps1
      const yesFlag = autoConfirm ? " -Y" : "";
      execSync(
        `powershell -ExecutionPolicy Bypass -File "${scriptPath}"${yesFlag}`,
        {
          cwd: skillsDir,
          stdio: "inherit",
        }
      );
    } else {
      // -y flag skips all prompts in install.sh
      const yesFlag = autoConfirm ? " -y" : "";
      execSync(`bash "${scriptPath}"${yesFlag}`, {
        cwd: skillsDir,
        stdio: "inherit",
      });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if .env exists, prompt to create if not
 */
async function checkEnvFile(
  skillsDir: string,
  isNonInteractive: boolean
): Promise<void> {
  const envPath = join(skillsDir, ".env");
  const envExamplePath = join(skillsDir, ".env.example");

  if (existsSync(envPath)) {
    logger.verbose(".env file exists");
    return;
  }

  if (!existsSync(envExamplePath)) {
    logger.verbose("No .env.example found");
    return;
  }

  p.log.warning("No .env file found.");

  if (isNonInteractive) {
    p.log.info("Copy .env.example to .env and configure your credentials.");
    return;
  }

  const shouldCreate = await p.confirm({
    message: "Would you like to configure credentials now?",
  });

  if (p.isCancel(shouldCreate) || !shouldCreate) {
    p.log.info("You can configure later by copying .env.example to .env");
    return;
  }

  // Prompt for credentials
  const credentials = await p.group({
    backlogUrl: () =>
      p.text({
        message: "Backlog Space URL",
        placeholder: "https://xxx.backlog.jp",
        validate: (value) => {
          if (!value) return "Required";
          if (!value.includes("backlog")) return "Invalid Backlog URL";
        },
      }),
    apiKey: () =>
      p.password({
        message: "Backlog API Key",
        validate: (value) => {
          if (!value) return "Required";
        },
      }),
    projectKey: () =>
      p.text({
        message: "Backlog Project Key",
        placeholder: "PROJECT",
        validate: (value) => {
          if (!value) return "Required";
        },
      }),
  });

  if (p.isCancel(credentials)) {
    return;
  }

  // Write .env file
  const envContent = `# BrseKit Configuration
BACKLOG_SPACE_URL=${credentials.backlogUrl}
BACKLOG_API_KEY=${credentials.apiKey}
BACKLOG_PROJECT_KEY=${credentials.projectKey}

# Optional: Google API for semantic search
# GOOGLE_API_KEY=your-gemini-api-key
`;

  const fs = await import("node:fs/promises");
  await fs.writeFile(envPath, envContent);
  p.log.success("Created .env file");
}

/**
 * Handle post-installation tasks
 */
export async function handlePostInstall(ctx: InitContext): Promise<InitContext> {
  logger.verbose("Running post-installation tasks");

  // Check/create .env
  await checkEnvFile(ctx.skillsDir, ctx.isNonInteractive);

  // Handle dependency installation based on mode:
  // - skipDeps=true: Skip installation (user explicitly requested)
  // - isNonInteractive=true (-y): Auto-run (yes to all = auto-install)
  // - interactive: Ask user
  if (ctx.skipDeps) {
    logger.verbose("Skipping dependency installation (--skip-deps)");
    p.log.info("Skipping dependency installation (use install.sh/install.ps1 manually)");
  } else if (ctx.isNonInteractive) {
    // Non-interactive mode: auto-run install script with -Y flag
    // -y flag means "yes to all", not "skip all"
    const spinner = p.spinner();
    spinner.start("Installing dependencies (auto-confirmed)...");

    const success = await runInstallScript(ctx.skillsDir, true);

    if (success) {
      spinner.stop("Dependencies installed");
    } else {
      spinner.stop("Some dependencies may have failed to install");
      p.log.warning("You can retry manually: .claude/skills/install.ps1 (Windows) or install.sh (Unix)");
    }
  } else {
    // Interactive mode: ask user
    const shouldInstall = await p.confirm({
      message: "Run installation script to setup dependencies?",
      initialValue: true,
    });

    if (!p.isCancel(shouldInstall) && shouldInstall) {
      const spinner = p.spinner();
      spinner.start("Installing dependencies...");

      // User already confirmed via CLI, pass -Y to skip install script prompts
      const success = await runInstallScript(ctx.skillsDir, true);

      if (success) {
        spinner.stop("Dependencies installed");
      } else {
        spinner.stop("Some dependencies may have failed to install");
      }
    }
  }

  return ctx;
}
