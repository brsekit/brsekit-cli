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
//# sourceMappingURL=constants.js.map