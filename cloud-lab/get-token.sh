#!/bin/bash

# get-token.sh
# Lấy token tạm thời để đăng ký runner

set -e

if [ -z "$GH_TOKEN" ]; then
  echo "❌ GH_TOKEN not set. Please export your GitHub Personal Access Token:"
  echo "   export GH_TOKEN=ghp_your_token_here"
  exit 1
fi

echo "🛠️ Getting registration token for TomTrade repository..."

RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/tommyle1310/TomTrade/actions/runners/registration-token)

if [ $? -ne 0 ]; then
  echo "❌ Failed to get registration token"
  exit 1
fi

# Extract token using grep and sed instead of jq
TOKEN=$(echo "$RESPONSE" | grep -o '"token": *"[^"]*"' | sed 's/"token": *"\([^"]*\)"/\1/')

if [ -z "$TOKEN" ]; then
  echo "❌ Invalid response: $RESPONSE"
  exit 1
fi

echo "✅ Registration token: $TOKEN"
