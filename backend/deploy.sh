#!/bin/bash

# Sportify AI Deployment Script
# Run this on your PHP hosting server after uploading files

echo "🚀 Starting Sportify AI Deployment..."

# Check PHP version
echo "📋 Checking PHP version..."
php --version

# Install dependencies (if not already uploaded)
echo "📦 Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader

# Copy environment file
echo "⚙️ Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "❗ Please edit .env file with your database and AI service settings"
    exit 1
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Clear and cache config
echo "🧹 Clearing and caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:clear
php artisan route:cache
php artisan view:clear
php artisan view:cache

# Set proper permissions
echo "🔒 Setting proper permissions..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/

echo "✅ Backend deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Upload frontend files (client/out/) to your web root"
echo "2. Deploy AI service to separate hosting"
echo "3. Update .env with AI service URL"
echo "4. Test the application"
echo ""
echo "🌐 Your Laravel app should now be accessible!"