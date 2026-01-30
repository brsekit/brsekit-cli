/**
 * Types for init command
 */

export interface InitOptions {
  dir?: string;
  release?: string;
  global?: boolean;
  fresh?: boolean;
  yes?: boolean;
  beta?: boolean;
  verbose?: boolean;
}

export interface InitContext {
  options: InitOptions;
  resolvedDir: string;
  skillsDir: string;
  isGlobal: boolean;
  isNonInteractive: boolean;
  selectedVersion: string;
  tempDir?: string;
  extractDir?: string;
  cancelled: boolean;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  prerelease: boolean;
  published_at: string;
  zipball_url: string;
  tarball_url: string;
  assets: GitHubAsset[];
}

export interface GitHubAsset {
  id: number;
  name: string;
  browser_download_url: string;
  size: number;
}
