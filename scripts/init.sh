#!/bin/bash

# Template Mobile App - Initialization Script
#
# Run this script after cloning to customize the template for your project.
# Usage: ./scripts/init.sh

set -e

echo "================================"
echo "Template Mobile App - Setup"
echo "================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
./scripts/doctor.sh || exit 1
echo ""

# Get app details from user
echo "Let's configure your new app:"
echo ""

read -p "App name (e.g., MyAwesomeApp): " APP_NAME
if [ -z "$APP_NAME" ]; then
    echo "Error: App name is required"
    exit 1
fi

read -p "Bundle ID (e.g., com.company.myapp): " BUNDLE_ID
if [ -z "$BUNDLE_ID" ]; then
    echo "Error: Bundle ID is required"
    exit 1
fi

# Convert app name to slug (lowercase, hyphens)
APP_SLUG=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd '[:alnum:]-')

echo ""
echo "Configuration:"
echo "  App Name: $APP_NAME"
echo "  Bundle ID: $BUNDLE_ID"
echo "  Slug: $APP_SLUG"
echo ""

read -p "Continue? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Updating configuration files..."

# Update app.json
if [ -f "app.json" ]; then
    # macOS sed requires different syntax
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"name\": \"template-mobile-app\"/\"name\": \"$APP_NAME\"/" app.json
        sed -i '' "s/\"slug\": \"template-mobile-app\"/\"slug\": \"$APP_SLUG\"/" app.json
        sed -i '' "s/\"scheme\": \"template-mobile-app\"/\"scheme\": \"$APP_SLUG\"/" app.json
        sed -i '' "s/com.company.templatemobileapp/$BUNDLE_ID/g" app.json
    else
        sed -i "s/\"name\": \"template-mobile-app\"/\"name\": \"$APP_NAME\"/" app.json
        sed -i "s/\"slug\": \"template-mobile-app\"/\"slug\": \"$APP_SLUG\"/" app.json
        sed -i "s/\"scheme\": \"template-mobile-app\"/\"scheme\": \"$APP_SLUG\"/" app.json
        sed -i "s/com.company.templatemobileapp/$BUNDLE_ID/g" app.json
    fi
    echo "  ✓ Updated app.json"
fi

# Update package.json
if [ -f "package.json" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"name\": \"template-mobile-app\"/\"name\": \"$APP_SLUG\"/" package.json
    else
        sed -i "s/\"name\": \"template-mobile-app\"/\"name\": \"$APP_SLUG\"/" package.json
    fi
    echo "  ✓ Updated package.json"
fi

# Copy .env.example to .env
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  ✓ Created .env from .env.example"
fi

# Remove template git history and initialize fresh
read -p "Remove git history and start fresh? (y/n): " RESET_GIT
if [ "$RESET_GIT" == "y" ] || [ "$RESET_GIT" == "Y" ]; then
    rm -rf .git
    git init
    echo "  ✓ Initialized new git repository"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "  ✓ Dependencies installed"

# Install pre-commit hooks
if command -v pre-commit &> /dev/null; then
    pre-commit install
    echo "  ✓ Pre-commit hooks installed"
else
    echo "  ⚠ pre-commit not found - skipping hook installation"
    echo "    Install with: pip install pre-commit"
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your API URL"
echo "  2. Run 'make dev' to start development"
echo "  3. Happy coding!"
echo ""
