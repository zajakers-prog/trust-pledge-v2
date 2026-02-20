#!/bin/bash

# Ensure we are in the correct directory
if [ ! -f "package.json" ] || ! grep -q "trust-platform-v2" package.json; then
    echo "Error: You are not in the trust-platform-v2 directory!"
    echo "Please cd into the directory first."
    exit 1
fi

echo "✅ Verified directory: trust-platform-v2"
echo "🚀 Starting Deployment..."

# Force production deployment using the local configuration
npx vercel --prod --yes

echo "✨ Deployment Command Finished!"
