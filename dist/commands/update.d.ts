/**
 * Update command - shortcut for updating BrseKit to latest version
 * Checks if BrseKit is already installed, then runs init with latest
 */
export interface UpdateOptions {
    dir?: string;
    release?: string;
    verbose?: boolean;
    yes?: boolean;
    beta?: boolean;
    fresh?: boolean;
    skipDeps?: boolean;
}
/**
 * Main update command handler
 */
export declare function updateCommand(options: UpdateOptions): Promise<void>;
//# sourceMappingURL=update.d.ts.map