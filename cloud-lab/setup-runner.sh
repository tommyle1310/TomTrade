#!/bin/bash

echo "🚀 GitHub Actions Self-Hosted Runner Setup"
echo "=========================================="
echo ""

# Check if GH_TOKEN is set
if [ -z "$GH_TOKEN" ]; then
  echo "❌ GH_TOKEN not set."
  echo ""
  echo "📋 To set up your GitHub Personal Access Token:"
  echo "1. Go to GitHub Settings > Developer settings > Personal access tokens"
  echo "2. Click 'Generate new token (classic)'"
  echo "3. Give it a name like 'TomTrade Runner Token'"
  echo "4. Select these permissions:"
  echo "   ✅ repo (Full control of private repositories)"
  echo "   ✅ admin:repo_hook (Full control of repository hooks)"
  echo "5. Copy the token and run:"
  echo "   export GH_TOKEN=ghp_your_token_here"
  echo ""
  echo "Then run this script again."
  exit 1
fi

echo "✅ GH_TOKEN is set"
echo ""

# Test token
echo "🔍 Testing GitHub token..."
RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user)

# Check if response contains login field (indicates success)
if echo "$RESPONSE" | grep -q '"login"'; then
  # Extract username using grep and sed instead of jq
  USERNAME=$(echo "$RESPONSE" | grep -o '"login": *"[^"]*"' | sed 's/"login": *"\([^"]*\)"/\1/')
  echo "✅ Token valid for user: $USERNAME"
else
  echo "❌ Invalid GitHub token. Please check your GH_TOKEN."
  echo "Response: $RESPONSE"
  exit 1
fi
echo ""

# Test repository access
echo "🔍 Testing repository access..."
REPO_RESPONSE=$(curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/repos/tommyle1310/TomTrade)

# Check if response contains name field (indicates success)
if echo "$REPO_RESPONSE" | grep -q '"name"'; then
  # Extract repo name using grep and sed instead of jq
  REPO_NAME=$(echo "$REPO_RESPONSE" | grep -o '"name": *"[^"]*"' | sed 's/"name": *"\([^"]*\)"/\1/')
  echo "✅ Repository access confirmed: $REPO_NAME"
else
  echo "❌ Cannot access repository. Please check permissions."
  echo "Response: $REPO_RESPONSE"
  exit 1
fi
echo ""

echo "🚀 Starting runner setup..."
./restart-runner.sh