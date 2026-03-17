# brsekit-cli

CLI tool for bootstrapping and updating [BrseKit](https://github.com/brsekit) — an AI-powered toolkit for Bridge System Engineers (BrSE).

## Requirements

- **Node.js** >= 18
- **GitHub CLI** (`gh`) — authenticated with access to the BrseKit repository

## Installation

```bash
npm install -g brsekit-cli
```

Verify the installation:

```bash
bk --version
```

## Authentication

The CLI downloads BrseKit from a private GitHub repository. Authentication is required.

**Option 1 — GitHub CLI (recommended):**

```bash
gh auth login
```

**Option 2 — Environment variable:**

```bash
export GITHUB_TOKEN=your_personal_access_token
```

> Your account must have been granted access to the BrseKit repository. Contact the BrseKit team to request access.

## Commands

### `bk init`

Initialize BrseKit in your current project (or a specified directory).

```bash
bk init [options]
```

| Option | Description |
|---|---|
| `--dir <dir>` | Target directory (default: current directory) |
| `-r, --release <version>` | Install a specific version (e.g., `v1.2.0`, `latest`) |
| `-g, --global` | Install globally to `~/.claude` |
| `--fresh` | Clean reinstall — removes existing installation |
| `-y, --yes` | Non-interactive mode, accept all defaults |
| `--beta` | Include beta/prerelease versions |
| `--skip-deps` | Skip running the post-install dependency script |
| `-v, --verbose` | Enable verbose logging |

**Examples:**

```bash
# Install in current project
bk init

# Install globally (user-level)
bk init --global

# Install a specific version, non-interactive
bk init --release v1.2.0 --yes

# Clean reinstall
bk init --fresh
```

### `bk update`

Update an existing BrseKit installation to the latest version.

```bash
bk update [options]
```

Accepts the same options as `bk init` (except `--global`). Requires BrseKit to already be installed in the target directory.

```bash
# Update current project to latest
bk update

# Update to a specific version
bk update --release v1.5.0
```

### `bk doctor`

Run a health check on your BrseKit installation.

```bash
bk doctor [options]
```

| Option | Description |
|---|---|
| `--fix` | Attempt to auto-fix detected issues |
| `-v, --verbose` | Show detailed diagnostic information |

```bash
bk doctor
bk doctor --fix
```

### `bk version`

Display the current CLI version and installed BrseKit kit version.

```bash
bk version
```

## Typical Workflow

```bash
# 1. Authenticate with GitHub
gh auth login

# 2. Navigate to your project
cd my-project

# 3. Install BrseKit
bk init

# 4. Later, update to the latest version
bk update

# 5. If something seems wrong
bk doctor --fix
```

## License

MIT
