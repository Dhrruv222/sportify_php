#!/bin/bash
# Deploy Sportify AI to Railway

echo "🚀 Deploying Sportify AI to Railway..."

# Install Railway CLI if not present
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "Please login to your Railway account..."
railway login

# Create new project
echo "Creating Railway project..."
railway init

# Deploy
echo "Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "Your API will be available at: https://<your-railway-url>.railway.app"
