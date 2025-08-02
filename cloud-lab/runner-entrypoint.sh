#!/bin/bash
set -e

# Fix Docker socket permissions first (as root)
sudo chmod 666 /var/run/docker.sock || true

cd /home/clouduser/actions-runner

# Function to cleanup on exit
cleanup() {
    echo ">> Cleaning up runner registration..."
    if [ -f "./config.sh" ] && [ -x "./config.sh" ]; then
        ./config.sh remove --token "${RUNNER_TOKEN}" || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Check if runner is already configured
if [ -f ".runner" ]; then
    echo ">> Runner already configured, removing old config..."
    if [ -f "./config.sh" ] && [ -x "./config.sh" ]; then
        ./config.sh remove --token "${RUNNER_TOKEN}" || true
    fi
fi

echo ">> Configuring new GitHub runner..."
./config.sh \
  --unattended \
  --url "${REPO_URL}" \
  --token "${RUNNER_TOKEN}" \
  --name "${RUNNER_NAME}" \
  --labels "${RUNNER_LABELS}" \
  --replace

echo ">> Starting GitHub Actions runner..."
# Disable auto-update to prevent restart loops
export ACTIONS_RUNNER_DISABLEUPDATE=1

exec ./run.sh
