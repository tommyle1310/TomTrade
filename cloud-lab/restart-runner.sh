#!/bin/bash
set -e

# Check if GH_TOKEN is set
if [ -z "$GH_TOKEN" ]; then
  echo "❌ GH_TOKEN not set. Please export your GitHub Personal Access Token:"
  echo "   export GH_TOKEN=ghp_your_token_here"
  echo ""
  echo "To create a token:"
  echo "1. Go to GitHub Settings > Developer settings > Personal access tokens"
  echo "2. Generate new token with 'repo' and 'admin:repo_hook' permissions"
  exit 1
fi

echo "🛑 Stopping and removing existing containers..."
docker compose -f ./docker-compose.yml down -v

echo "🏗️ Building fresh images..."
docker compose -f ./docker-compose.yml build --no-cache runner

echo "🚀 Starting containers..."
docker compose -f ./docker-compose.yml up -d

echo "⏳ Waiting for runner to initialize..."
sleep 10

echo "📋 Checking container status..."
docker compose -f ./docker-compose.yml ps

echo "📝 Following runner logs..."
docker logs -f github-runner