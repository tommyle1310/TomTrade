#!/bin/bash

echo "Testing token: $GH_TOKEN"

echo "Testing GitHub API access..."
curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/user

echo ""
echo "Testing repository access..."
curl -s -H "Authorization: token $GH_TOKEN" https://api.github.com/repos/tommyle1310/TomTrade

echo ""
echo "Testing registration token..."
curl -s -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/tommyle1310/TomTrade/actions/runners/registration-token