# GitHub Actions Self-Hosted Runner Setup

This directory contains the configuration for running a self-hosted GitHub Actions runner for the TomTrade project.

## Quick Start

1. **Create GitHub Personal Access Token**

   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token (classic) with these permissions:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `admin:repo_hook` (Full control of repository hooks)

2. **Set Environment Variable**

   ```bash
   export GH_TOKEN=ghp_your_token_here
   ```

3. **Run Setup**
   ```bash
   cd cloud-lab
   chmod +x setup-runner.sh
   ./setup-runner.sh
   ```

## Files Overview

- **`Dockerfile.runner`** - Docker image for the GitHub Actions runner with Node.js 20.x
- **`docker-compose.yml`** - Complete stack including backend services and runner
- **`runner-entrypoint.sh`** - Runner initialization script with error handling
- **`setup-runner.sh`** - Interactive setup script with token validation
- **`restart-runner.sh`** - Restart runner with fresh build
- **`get-token.sh`** - Utility to get registration tokens manually

## Troubleshooting

### Runner Queuing Forever

- **Cause**: Usually authentication issues or missing dependencies
- **Solution**: Check logs with `docker logs github-runner`

### Token Issues

- **Invalid token**: Regenerate with correct permissions
- **Expired token**: Create new token (they expire based on your settings)

### Container Won't Start

- **Check logs**: `docker logs github-runner`
- **Rebuild**: `./restart-runner.sh`

### Common Commands

```bash
# Check runner status
docker ps | grep github-runner

# View runner logs
docker logs -f github-runner

# Restart runner
./restart-runner.sh

# Stop everything
docker compose down

# Manual token test
./get-token.sh
```

## Environment Variables

The runner needs these environment variables (set in docker-compose.yml):

- `GH_TOKEN` - Your GitHub Personal Access Token
- `RUNNER_NAME` - Name for the runner (default: local-runner)
- `RUNNER_LABELS` - Labels for the runner (default: self-hosted,linux,docker)
- `REPO_URL` - Repository URL (https://github.com/tommyle1310/TomTrade)

## Security Notes

- Never commit your `GH_TOKEN` to version control
- Use environment variables or `.env` files (add to .gitignore)
- Regularly rotate your GitHub tokens
- The runner has Docker access for CI/CD operations

## Workflow Integration

In your GitHub Actions workflows, target the self-hosted runner:

```yaml
jobs:
  build:
    runs-on: [self-hosted, linux]
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      # Your build steps here
```
