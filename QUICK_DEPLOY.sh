#!/bin/bash

# ONE-CLICK DEPLOY SCRIPT FOR ORIN AI
# Simply run: bash QUICK_DEPLOY.sh

echo "🚀 ORIN AI - Quick Deploy"
echo "========================="

# Stage all changes
echo "📝 Staging changes..."
git add .

# Commit with timestamp
echo "💾 Committing..."
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "update: Deploy $TIMESTAMP"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ SUCCESS!"
echo "Vercel is now auto-deploying your site..."
echo "Check: https://vercel.com/marvin-villanuevas-projects/orin-revamp"
echo "Live: https://orin-revamp.vercel.app"
echo ""
echo "Deployment will be live in 1-2 minutes!"
