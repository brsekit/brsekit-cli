/**
 * BrseKit CLI constants
 */
export const GITHUB_ORG = "brsekit";
export const STARTER_REPO = "brsekit-starter";
export const CLI_REPO = "brsekit-cli";
export const KIT_CONFIG = {
    name: "BrseKit Starter",
    owner: GITHUB_ORG,
    repo: STARTER_REPO,
    description: "BrSE Toolkit - AI-powered tools for Bridge System Engineers",
};
// Files/patterns to never overwrite during updates
export const PROTECTED_PATTERNS = [
    ".env",
    ".env.local",
    ".env.*.local",
    "*.key",
    "*.pem",
    "node_modules/**",
    ".git/**",
    "__pycache__/**",
    ".pytest_cache/**",
    ".coverage",
];
// Default target directory for skills
export const DEFAULT_SKILLS_DIR = ".claude/skills";
// Deprecated skills removed in v1.1.0
// These will be deleted during update with user confirmation
export const DEPRECATED_SKILLS = [
    "bk-minutes", // Merged into bk-capture
    "bk-report", // Merged into bk-track
    "bk-status", // Merged into bk-track
    "bk-task", // Merged into bk-capture
    "bk-tester", // Merged into bk-spec
    "bk-translate", // Merged into bk-convert
];
// Folders that should be installed at workspace root (not in .claude/skills/)
// These are DATA folders, not CODE folders
export const WORKSPACE_FOLDERS = [
    "projects", // Per-project configs: context.yaml, .env, vault/
    "knowledge", // Shared knowledge: glossaries, templates
];
//# sourceMappingURL=constants.js.map