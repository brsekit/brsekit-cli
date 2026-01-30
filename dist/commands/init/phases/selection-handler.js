/**
 * Phase 3: Version selection
 */
import * as p from "@clack/prompts";
import { Octokit } from "@octokit/rest";
import { logger } from "../../../shared/logger.js";
import { GITHUB_ORG, STARTER_REPO } from "../../../shared/constants.js";
import { getGhToken } from "./auth-handler.js";
/**
 * Fetch available releases from GitHub
 */
async function fetchReleases(includeBeta) {
    const token = process.env.GITHUB_TOKEN || getGhToken();
    const octokit = new Octokit({
        auth: token,
    });
    try {
        const { data } = await octokit.repos.listReleases({
            owner: GITHUB_ORG,
            repo: STARTER_REPO,
            per_page: 20,
        });
        let releases = data;
        // Filter out prereleases if not including beta
        if (!includeBeta) {
            releases = releases.filter((r) => !r.prerelease);
        }
        return releases;
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Not Found")) {
            throw new Error(`Repository ${GITHUB_ORG}/${STARTER_REPO} not found or not accessible.\n` +
                "Make sure you have access to the repository.");
        }
        throw error;
    }
}
/**
 * Handle version selection
 */
export async function handleSelection(ctx) {
    logger.verbose("Starting version selection");
    // If version already specified, use it
    if (ctx.selectedVersion) {
        if (ctx.selectedVersion === "latest") {
            const releases = await fetchReleases(ctx.options.beta ?? false);
            if (releases.length === 0) {
                p.log.error("No releases found.");
                return { ...ctx, cancelled: true };
            }
            return { ...ctx, selectedVersion: releases[0].tag_name };
        }
        return ctx;
    }
    // Non-interactive mode: use latest
    if (ctx.isNonInteractive) {
        const releases = await fetchReleases(ctx.options.beta ?? false);
        if (releases.length === 0) {
            p.log.error("No releases found.");
            return { ...ctx, cancelled: true };
        }
        p.log.info(`Using latest version: ${releases[0].tag_name}`);
        return { ...ctx, selectedVersion: releases[0].tag_name };
    }
    // Interactive: show version selection
    const spinner = p.spinner();
    spinner.start("Fetching available versions...");
    try {
        const releases = await fetchReleases(ctx.options.beta ?? false);
        spinner.stop("Found " + releases.length + " versions");
        if (releases.length === 0) {
            p.log.error("No releases found.");
            return { ...ctx, cancelled: true };
        }
        const options = releases.slice(0, 10).map((r) => ({
            value: r.tag_name,
            label: `${r.tag_name}${r.prerelease ? " (beta)" : ""}`,
            hint: new Date(r.published_at).toLocaleDateString(),
        }));
        const selected = await p.select({
            message: "Select version to install:",
            options,
        });
        if (p.isCancel(selected)) {
            return { ...ctx, cancelled: true };
        }
        return { ...ctx, selectedVersion: selected };
    }
    catch (error) {
        spinner.stop("Failed to fetch versions");
        if (error instanceof Error) {
            p.log.error(error.message);
        }
        return { ...ctx, cancelled: true };
    }
}
//# sourceMappingURL=selection-handler.js.map