#!/bin/bash
set -e

echo "📦 Building Docker image..."
docker build -t local-ec2 . || exit 1

echo "🧹 Cleaning old container..."
docker stop local-ec2 >/dev/null 2>&1 || true
docker rm local-ec2 >/dev/null 2>&1 || true

echo "🚀 Starting new container..."
docker run -d \
  --name local-ec2 \
  -p 2222:22 \
  -v "$(pwd -W)/../backend:/home/clouduser/app" \
  local-ec2

echo "⏳ Waiting for container to initialize SSH..."
sleep 5

# Check if container is running
if ! docker ps | grep -q local-ec2; then
    echo "❌ Container failed to start. Checking logs:"
    docker logs local-ec2
    exit 1
fi

echo "🔧 Fixing folder ownership inside container..."
docker exec local-ec2 chown -R clouduser:clouduser /home/clouduser/app || echo "⚠️ Warning: chown failed (may be due to Windows path)"

echo "✅ EC2 local container started!"
echo "🔑 SSH into it using:"
echo "    ssh clouduser@localhost -p 2222 (Password: 1234)"
