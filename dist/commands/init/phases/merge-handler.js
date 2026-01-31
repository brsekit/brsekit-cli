/**
 * Phase 5: Merge files to target directory
 */
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import * as p from "@clack/prompts";
import fse from "fs-extra";
import { logger } from "../../../shared/logger.js";
import { PROTECTED_PATTERNS, DEPRECATED_SKILLS, WORKSPACE_FOLDERS } from "../../../shared/constants.js";
/**
 * Check if path matches any protected pattern
 */
function isProtected(relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, "/");
    for (const pattern of PROTECTED_PATTERNS) {
        // Simple glob matching
        if (pattern.includes("**")) {
            const prefix = pattern.replace("/**", "");
            if (normalizedPath.startsWith(prefix)) {
                return true;
            }
        }
        else if (pattern.includes("*")) {
            const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
            if (regex.test(normalizedPath)) {
                return true;
            }
        }
        else if (normalizedPath === pattern) {
            return true;
        }
    }
    return false;
}
/**
 * Copy directory recursively, respecting protected patterns
 */
async function copyDirectory(src, dest, stats) {
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
        }
        else {
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
 * Find deprecated skills that exist in target directory
 */
function findDeprecatedSkills(skillsDir) {
    if (!existsSync(skillsDir))
        return [];
    const found = [];
    for (const skill of DEPRECATED_SKILLS) {
        const skillPath = join(skillsDir, skill);
        if (existsSync(skillPath) && statSync(skillPath).isDirectory()) {
            found.push(skill);
        }
    }
    return found;
}
/**
 * Remove deprecated skills with user confirmation
 */
async function cleanupDeprecatedSkills(skillsDir, skipConfirm) {
    const deprecated = findDeprecatedSkills(skillsDir);
    if (deprecated.length === 0) {
        return { removed: [], skipped: [] };
    }
    // Show user what will be deleted
    p.log.warn(`Found ${deprecated.length} deprecated skill(s):`);
    for (const skill of deprecated) {
        p.log.message(`  • ${skill}`);
    }
    // Ask for confirmation unless --yes flag is set
    let shouldRemove = skipConfirm;
    if (!skipConfirm) {
        const confirm = await p.confirm({
            message: "Remove these deprecated skills? (They have been merged into other skills)",
            initialValue: true,
        });
        if (p.isCancel(confirm)) {
            return { removed: [], skipped: deprecated };
        }
        shouldRemove = confirm;
    }
    if (shouldRemove) {
        const removed = [];
        for (const skill of deprecated) {
            const skillPath = join(skillsDir, skill);
            try {
                rmSync(skillPath, { recursive: true, force: true });
                removed.push(skill);
                logger.verbose(`Removed deprecated skill: ${skill}`);
            }
            catch (error) {
                logger.verbose(`Failed to remove ${skill}: ${error}`);
            }
        }
        return { removed, skipped: [] };
    }
    return { removed: [], skipped: deprecated };
}
/**
 * Handle file merge
 */
export async function handleMerge(ctx) {
    if (!ctx.extractDir) {
        p.log.error("No extracted directory available.");
        return { ...ctx, cancelled: true };
    }
    logger.verbose("Starting merge", {
        from: ctx.extractDir,
        skillsDir: ctx.skillsDir,
        workspaceDir: ctx.resolvedDir,
    });
    const spinner = p.spinner();
    spinner.start("Installing files...");
    try {
        // Handle fresh install
        if (ctx.options.fresh && existsSync(ctx.skillsDir)) {
            spinner.message("Removing existing installation...");
            rmSync(ctx.skillsDir, { recursive: true, force: true });
        }
        // Ensure target directories exist
        mkdirSync(ctx.skillsDir, { recursive: true });
        const stats = { copied: 0, skipped: 0 };
        // Get all entries from extracted directory
        const entries = readdirSync(ctx.extractDir, { withFileTypes: true });
        // Handle entries based on type:
        // 1. WORKSPACE_FOLDERS (projects/, knowledge/) → workspace root
        // 2. .claude/ → merge into workspace's .claude/
        // 3. Everything else → .claude/skills/
        for (const entry of entries) {
            const srcPath = join(ctx.extractDir, entry.name);
            if (WORKSPACE_FOLDERS.includes(entry.name) && entry.isDirectory()) {
                // DATA folders → copy to workspace root
                const destPath = join(ctx.resolvedDir, entry.name);
                spinner.message(`Installing ${entry.name}/ to workspace root...`);
                mkdirSync(destPath, { recursive: true });
                await copyDirectory(srcPath, destPath, stats);
                logger.verbose(`Installed workspace folder: ${entry.name}/`);
            }
            else if (entry.name === ".claude" && entry.isDirectory()) {
                // .claude/ folder → merge into workspace's .claude/
                const destPath = join(ctx.resolvedDir, ".claude");
                spinner.message("Installing .claude/ folder...");
                mkdirSync(destPath, { recursive: true });
                await copyDirectory(srcPath, destPath, stats);
                logger.verbose("Installed .claude/ folder");
            }
            else {
                // Root-level files (README.md, install.sh, metadata.json, etc.) → .claude/skills/
                const destPath = join(ctx.skillsDir, entry.name);
                if (entry.isDirectory()) {
                    // Other directories at root → .claude/skills/
                    mkdirSync(destPath, { recursive: true });
                    await copyDirectory(srcPath, destPath, stats);
                }
                else {
                    // Root-level files
                    if (!isProtected(entry.name)) {
                        copyFileSync(srcPath, destPath);
                        stats.copied++;
                    }
                    else {
                        stats.skipped++;
                    }
                }
            }
        }
        // Write metadata to skills dir
        const metadata = {
            version: ctx.selectedVersion,
            installedAt: new Date().toISOString(),
            source: "brsekit-cli",
        };
        await fse.writeJson(join(ctx.skillsDir, "metadata.json"), metadata, {
            spaces: 2,
        });
        spinner.stop(`Installed ${stats.copied} files (${stats.skipped} protected)`);
        // Show where workspace folders were installed
        for (const folder of WORKSPACE_FOLDERS) {
            const folderPath = join(ctx.resolvedDir, folder);
            if (existsSync(folderPath)) {
                p.log.info(`  ${folder}/ → ${folderPath}`);
            }
        }
        // Cleanup deprecated skills (with user confirmation)
        const cleanup = await cleanupDeprecatedSkills(ctx.skillsDir, ctx.options.yes || false);
        if (cleanup.removed.length > 0) {
            p.log.success(`Removed ${cleanup.removed.length} deprecated skill(s)`);
        }
        // Cleanup temp directory
        if (ctx.tempDir) {
            rmSync(ctx.tempDir, { recursive: true, force: true });
        }
        return ctx;
    }
    catch (error) {
        spinner.stop("Installation failed");
        if (error instanceof Error) {
            p.log.error(error.message);
        }
        return { ...ctx, cancelled: true };
    }
}
//# sourceMappingURL=merge-handler.js.map