#!/bin/bash

set -e

# Check required environment variables
if [ -z "$REPO_URL" ]; then
  echo "❌ REPO_URL not set"
  exit 1
fi

if [ -z "$GH_TOKEN" ]; then
  echo "❌ GH_TOKEN not set"
  exit 1
fi

if [ -z "$RUNNER_NAME" ]; then
  echo "❌ RUNNER_NAME not set"
  exit 1
fi

echo "🛠️ Getting registration token..."
TOKEN_RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "${REPO_URL}/actions/runners/registration-token")

if [ $? -ne 0 ]; then
  echo "❌ Failed to get registration token"
  exit 1
fi

# Extract token using grep and sed instead of jq
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token": *"[^"]*"' | sed 's/"token": *"\([^"]*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo "❌ Invalid token received: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Token received successfully"

# Remove existing runner if it exists
echo "🧹 Removing existing runner configuration..."
./config.sh remove --token "$TOKEN" || true

echo "📦 Configuring runner..."
./config.sh --url "$REPO_URL" --token "$TOKEN" --name "$RUNNER_NAME" --labels "$RUNNER_LABELS" --unattended --replace

if [ $? -ne 0 ]; then
  echo "❌ Failed to configure runner"
  exit 1
fi

echo "✅ Runner configured successfully"
echo "🚀 Starting runner..."
./run.sh
