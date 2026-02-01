/**
 * Phase 1: Options resolution and validation
 */
import { join } from "node:path";
import { logger } from "../../../shared/logger.js";
/**
 * Resolve and validate init options
 */
export async function resolveOptions(options) {
    logger.verbose("Resolving options", options);
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const isGlobal = options.global ?? false;
    const isNonInteractive = options.yes ?? false;
    const skipDeps = options.skipDeps ?? false;
    // Determine target directory
    let resolvedDir;
    if (options.dir) {
        resolvedDir = options.dir;
    }
    else if (isGlobal) {
        resolvedDir = homeDir;
    }
    else {
        resolvedDir = process.cwd();
    }
    // Skills directory path
    const skillsDir = join(resolvedDir, ".claude", "skills");
    logger.verbose("Resolved paths", { resolvedDir, skillsDir, isGlobal });
    return {
        options,
        resolvedDir,
        skillsDir,
        isGlobal,
        isNonInteractive,
        skipDeps,
        selectedVersion: options.release || "",
        cancelled: false,
    };
}
//# sourceMappingURL=options-resolver.js.map