/**
 * Init command orchestrator
 * Coordinates all init phases using context pattern
 */
import * as p from "@clack/prompts";
import { resolveOptions, handleAuth, handleSelection, handleDownload, handleMerge, handlePostInstall, } from "./phases/index.js";
import { logger } from "../../shared/logger.js";
/**
 * Main init command handler
 */
export async function initCommand(options) {
    if (options.verbose) {
        logger.setVerbose(true);
    }
    p.intro("BrseKit Installer");
    try {
        // Phase 1: Options resolution
        let ctx = await resolveOptions(options);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 1 complete: Options resolved");
        // Phase 2: Authentication
        ctx = await handleAuth(ctx);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 2 complete: Authentication verified");
        // Phase 3: Version selection
        ctx = await handleSelection(ctx);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 3 complete: Version selected", {
            version: ctx.selectedVersion,
        });
        // Phase 4: Download and extract
        ctx = await handleDownload(ctx);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 4 complete: Downloaded and extracted");
        // Phase 5: Merge files
        ctx = await handleMerge(ctx);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 5 complete: Files merged");
        // Phase 6: Post-installation
        ctx = await handlePostInstall(ctx);
        if (ctx.cancelled) {
            p.outro("Installation cancelled.");
            return;
        }
        logger.verbose("Phase 6 complete: Post-install done");
        // Success
        p.outro(`BrseKit ${ctx.selectedVersion} installed successfully!`);
        // Show next steps
        console.log();
        console.log("Next steps:");
        console.log("  1. Configure .env with your credentials (if not done)");
        console.log("  2. Run 'bk doctor' to verify installation");
        console.log("  3. Start using BrseKit skills in Claude Code!");
        console.log();
    }
    catch (error) {
        if (error instanceof Error) {
            p.log.error(error.message);
            logger.verbose("Error details", { stack: error.stack });
        }
        else {
            p.log.error("An unexpected error occurred");
        }
        process.exitCode = 1;
    }
}
//# sourceMappingURL=init-command.js.map