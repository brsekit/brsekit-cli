/**
 * Version command - Show CLI and kit versions
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import pc from "picocolors";
const __dirname = dirname(fileURLToPath(import.meta.url));
/**
 * Get CLI version from package.json
 */
function getCliVersion() {
    try {
        const pkgPath = join(__dirname, "..", "..", "package.json");
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        return pkg.version || "unknown";
    }
    catch {
        return "unknown";
    }
}
/**
 * Get installed kit version from metadata
 */
function getKitVersion(skillsDir) {
    const metadataPath = join(skillsDir, "metadata.json");
    if (!existsSync(metadataPath)) {
        return null;
    }
    try {
        const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));
        return metadata.version || null;
    }
    catch {
        return null;
    }
}
/**
 * Version command handler
 */
export async function versionCommand() {
    const cliVersion = getCliVersion();
    console.log();
    console.log(pc.bold("BrseKit CLI"));
    console.log(`  CLI version: ${pc.green(cliVersion)}`);
    // Check local installation
    const localSkillsDir = join(process.cwd(), ".claude", "skills");
    const localVersion = getKitVersion(localSkillsDir);
    if (localVersion) {
        console.log(`  Kit version (local): ${pc.green(localVersion)}`);
    }
    // Check global installation
    const homeDir = process.env.HOME || process.env.USERPROFILE || "";
    const globalSkillsDir = join(homeDir, ".claude", "skills");
    const globalVersion = getKitVersion(globalSkillsDir);
    if (globalVersion) {
        console.log(`  Kit version (global): ${pc.green(globalVersion)}`);
    }
    if (!localVersion && !globalVersion) {
        console.log(pc.dim("  No BrseKit installation found"));
        console.log(pc.dim("  Run 'bk init' to install"));
    }
    console.log();
}
//# sourceMappingURL=version.js.map