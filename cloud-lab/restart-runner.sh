#!/bin/bash
set -e

echo "🛑 Stopping and removing existing containers..."
docker compose -f ./docker-compose.yml down -v

echo "🏗️ Building fresh images..."
docker compose -f ./docker-compose.yml build --no-cache runner

echo "🚀 Starting containers..."
docker compose -f ./docker-compose.yml up -d

echo "📋 Checking container status..."
docker compose -f ./docker-compose.yml ps

echo "📝 Following runner logs..."
docker logs -f github-runner