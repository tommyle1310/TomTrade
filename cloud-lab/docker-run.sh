#!/bin/bash
set -e

echo "📦 Building Docker image..."
docker build -t local-ec2 . || exit 1

echo "🧹 Cleaning old container..."
docker stop local-ec2 >/dev/null 2>&1 || true
docker rm local-ec2 >/dev/null 2>&1 || true

# FIX WINDOWS PATH: Convert Windows path to Docker-friendly path
HOST_BACKEND_PATH=$(pwd -W 2>/dev/null | sed 's|\\|/|g')/../backend

echo "🚀 Starting new container..."
docker run -d \
  --name local-ec2 \
  -p 2222:22 \
  -p 3000:3000 \
  -v "$HOST_BACKEND_PATH:/home/clouduser/app" \
  local-ec2

echo "⏳ Waiting for container to initialize SSH..."
sleep 5

if ! docker ps | grep -q local-ec2; then
    echo "❌ Container failed to start. Checking logs:"
    docker logs local-ec2
    exit 1
fi

echo "🔧 Fixing folder ownership inside container..."
docker exec local-ec2 chown -R clouduser:clouduser /home/clouduser/app || echo "⚠️ Warning: chown failed (may be due to Windows permissions)"

echo "✅ EC2 local container started!"
echo "🔑 SSH into it using:"
echo "    ssh clouduser@localhost -p 2222 (Password: 1234)"
