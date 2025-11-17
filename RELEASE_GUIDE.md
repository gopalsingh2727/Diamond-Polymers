# Auto-Release Guide for Diamond Polymers

## How Auto-Publishing Works

When you push code with a version tag, GitHub Actions automatically:
1. Builds the app for macOS, Windows, and Linux
2. Creates installers for all platforms
3. Publishes them to GitHub Releases
4. Users get automatic updates

## Quick Start: Create a Release

### Step 1: Update Version
```bash
cd /Users/gopalsingh/Desktop/27/27mainAll/main27
npm version patch  # For 1.0.1 -> 1.0.2 (bug fixes)
# OR
npm version minor  # For 1.0.1 -> 1.1.0 (new features)
# OR
npm version major  # For 1.0.1 -> 2.0.0 (breaking changes)
```

### Step 2: Push with Tag
```bash
git add .
git commit -m "Release v1.0.2"
git push origin main
git push origin --tags  # This triggers the build
```

### Step 3: Wait for Build
- Go to: https://github.com/gopalsingh2727/Diamond-Polymers/actions
- Watch the build progress (takes ~10-15 minutes)
- When complete, check: https://github.com/gopalsingh2727/Diamond-Polymers/releases

## Manual Release (Alternative)

If you want to build and upload manually:

```bash
# Build locally
npm run build

# Find the installers
open out/make

# Upload to GitHub Releases manually at:
# https://github.com/gopalsingh2727/Diamond-Polymers/releases/new
```

## What Gets Built

| Platform | Output Files |
|----------|-------------|
| **macOS** | `DiamondPolymers-darwin-arm64-{version}.zip` (Apple Silicon)<br>`DiamondPolymers-darwin-x64-{version}.zip` (Intel) |
| **Windows** | `DiamondPolymers-{version}-Setup.exe` (Installer) |
| **Linux** | `DiamondPolymers-{version}.deb` (Debian)<br>`DiamondPolymers-{version}.rpm` (Red Hat) |

## Auto-Updater

Once published, all users with the app installed will:
1. Automatically check for updates when they launch the app
2. See a notification when an update is available
3. Download and install updates automatically
4. Update applies when they quit and relaunch

## Troubleshooting

### Build Fails on GitHub Actions
- Check the Actions tab for error logs
- Make sure `package.json` version matches the tag
- Verify all dependencies are in `package.json`

### Users Not Getting Updates
- Verify the release is published (not draft)
- Check `package.json` version is incremented
- Make sure `electron-updater` is configured in `main.ts`

## Setup (One-Time Only)

Already configured! But if you need to set up a new repo:

1. Create repository on GitHub
2. Add this workflow file: `.github/workflows/build-release.yml`
3. Repository Settings → Actions → General → Workflow permissions → "Read and write permissions"
4. Push code and tags

## Version History Example

```bash
v1.0.0 - Initial release
v1.0.1 - Bug fixes and WebSocket integration
v1.0.2 - Performance improvements
v1.1.0 - New dashboard features
v2.0.0 - Major redesign
```

## Commands Cheat Sheet

```bash
# Check current version
npm version

# Create patch release (1.0.1 -> 1.0.2)
npm version patch && git push && git push --tags

# Create minor release (1.0.1 -> 1.1.0)
npm version minor && git push && git push --tags

# Create major release (1.0.1 -> 2.0.0)
npm version major && git push && git push --tags

# Build locally without publishing
npm run build

# Manually publish (requires GITHUB_TOKEN)
export GITHUB_TOKEN=your_token_here
npm run publish
```

## Security Note

The GitHub token is automatically provided by GitHub Actions (`secrets.GITHUB_TOKEN`). You don't need to add it manually - it's secure and automatic!
