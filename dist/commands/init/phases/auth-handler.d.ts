/**
 * Phase 2: Authentication handling
 */
import type { InitContext } from "../types.js";
/**
 * Get GitHub token from gh CLI
 */
export declare function getGhToken(): string | null;
/**
 * Handle authentication check and setup
 */
export declare function handleAuth(ctx: InitContext): Promise<InitContext>;
//# sourceMappingURL=auth-handler.d.ts.map