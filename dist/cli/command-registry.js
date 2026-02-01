/**
 * Command Registry
 * Registers all CLI commands with their options and handlers
 */
import { initCommand } from "../commands/init/init-command.js";
import { updateCommand } from "../commands/update.js";
import { doctorCommand } from "../commands/doctor.js";
import { versionCommand } from "../commands/version.js";
/**
 * Register all CLI commands
 */
export function registerCommands(cli) {
    // Init command - main command for installing/updating BrseKit
    cli
        .command("init", "Initialize or update BrseKit in current project")
        .option("--dir <dir>", "Target directory (default: current directory)")
        .option("-r, --release <version>", "Use specific version (e.g., latest, v1.0.0)")
        .option("-g, --global", "Install to user-level ~/.claude directory")
        .option("--fresh", "Clean reinstall (remove existing installation)")
        .option("-y, --yes", "Non-interactive mode with defaults")
        .option("--beta", "Show beta/prerelease versions")
        .option("--skip-deps", "Skip running install script for dependencies")
        .option("-v, --verbose", "Enable verbose logging")
        .action(async (options) => {
        await initCommand(options);
    });
    // Update command - shortcut for updating existing installation
    cli
        .command("update", "Update BrseKit to latest version")
        .option("--dir <dir>", "Target directory (default: current directory)")
        .option("-r, --release <version>", "Use specific version (e.g., latest, v1.5.0)")
        .option("--fresh", "Clean reinstall (remove existing installation)")
        .option("-y, --yes", "Non-interactive mode with defaults")
        .option("--beta", "Show beta/prerelease versions")
        .option("--skip-deps", "Skip running install script for dependencies")
        .option("-v, --verbose", "Enable verbose logging")
        .action(async (options) => {
        await updateCommand(options);
    });
    // Doctor command - health check
    cli
        .command("doctor", "Check BrseKit installation health")
        .option("--fix", "Attempt to auto-fix issues")
        .option("-v, --verbose", "Show detailed information")
        .action(async (options) => {
        await doctorCommand(options);
    });
    // Version command
    cli
        .command("version", "Show CLI and kit versions")
        .action(async () => {
        await versionCommand();
    });
}
//# sourceMappingURL=command-registry.js.map