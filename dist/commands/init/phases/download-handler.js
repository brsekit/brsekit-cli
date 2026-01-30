/**
 * Phase 4: Download and extract release
 */
import { mkdtempSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as p from "@clack/prompts";
import { Octokit } from "@octokit/rest";
import extractZip from "extract-zip";
import { logger } from "../../../shared/logger.js";
import { GITHUB_ORG, STARTER_REPO } from "../../../shared/constants.js";
import { getGhToken } from "./auth-handler.js";
/**
 * Download file from URL
 */
async function downloadFile(url, dest, token) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/octet-stream",
        },
    });
    if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const fs = await import("node:fs/promises");
    await fs.writeFile(dest, Buffer.from(buffer));
}
/**
 * Handle download and extraction
 */
export async function handleDownload(ctx) {
    logger.verbose("Starting download", { version: ctx.selectedVersion });
    const spinner = p.spinner();
    spinner.start(`Downloading ${ctx.selectedVersion}...`);
    try {
        const token = process.env.GITHUB_TOKEN || getGhToken();
        if (!token) {
            spinner.stop("Download failed");
            p.log.error("No GitHub token available.");
            return { ...ctx, cancelled: true };
        }
        const octokit = new Octokit({ auth: token });
        // Get release by tag
        const { data: release } = await octokit.repos.getReleaseByTag({
            owner: GITHUB_ORG,
            repo: STARTER_REPO,
            tag: ctx.selectedVersion,
        });
        // Create temp directory
        const tempDir = mkdtempSync(join(tmpdir(), "brsekit-"));
        const zipPath = join(tempDir, "release.zip");
        // Download zipball
        spinner.message("Downloading release archive...");
        const { data: zipball } = await octokit.repos.downloadZipballArchive({
            owner: GITHUB_ORG,
            repo: STARTER_REPO,
            ref: ctx.selectedVersion,
        });
        // Write to file
        const fs = await import("node:fs/promises");
        await fs.writeFile(zipPath, Buffer.from(zipball));
        // Extract
        spinner.message("Extracting...");
        const extractDir = join(tempDir, "extracted");
        mkdirSync(extractDir, { recursive: true });
        await extractZip(zipPath, { dir: extractDir });
        // Find the extracted folder (GitHub adds a prefix)
        const extractedContents = await fs.readdir(extractDir);
        const extractedFolder = extractedContents.find((name) => name.startsWith(`${GITHUB_ORG}-${STARTER_REPO}`));
        if (!extractedFolder) {
            throw new Error("Could not find extracted content");
        }
        const finalExtractDir = join(extractDir, extractedFolder);
        spinner.stop(`Downloaded ${ctx.selectedVersion}`);
        return {
            ...ctx,
            tempDir,
            extractDir: finalExtractDir,
        };
    }
    catch (error) {
        spinner.stop("Download failed");
        if (error instanceof Error) {
            p.log.error(error.message);
        }
        return { ...ctx, cancelled: true };
    }
}
//# sourceMappingURL=download-handler.js.map