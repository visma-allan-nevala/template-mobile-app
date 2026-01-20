#!/bin/bash

# Template Mobile App - Prerequisites Checker
#
# Checks that all required tools are installed.
# Usage: ./scripts/doctor.sh

echo "Checking prerequisites..."
echo ""

ERRORS=0

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 20 ]; then
        echo "✓ Node.js $NODE_VERSION"
    else
        echo "✗ Node.js $NODE_VERSION (requires 20+)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "✗ Node.js not found"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✓ npm $NPM_VERSION"
else
    echo "✗ npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo "✓ git $GIT_VERSION"
else
    echo "✗ git not found"
    ERRORS=$((ERRORS + 1))
fi

# Optional: Check Watchman
if command -v watchman &> /dev/null; then
    WATCHMAN_VERSION=$(watchman --version 2>/dev/null || echo "unknown")
    echo "✓ Watchman $WATCHMAN_VERSION"
else
    echo "○ Watchman not found (optional, improves file watching)"
fi

# Optional: Check Expo CLI
if command -v expo &> /dev/null; then
    EXPO_VERSION=$(expo --version 2>/dev/null || echo "unknown")
    echo "✓ Expo CLI $EXPO_VERSION"
else
    echo "○ Expo CLI not found (will use npx expo)"
fi

# Optional: Check pre-commit
if command -v pre-commit &> /dev/null; then
    PRECOMMIT_VERSION=$(pre-commit --version | cut -d' ' -f2)
    echo "✓ pre-commit $PRECOMMIT_VERSION"
else
    echo "○ pre-commit not found (optional, for git hooks)"
fi

echo ""

if [ $ERRORS -gt 0 ]; then
    echo "✗ $ERRORS required tool(s) missing"
    echo ""
    echo "Please install missing tools:"
    echo "  Node.js 20+: https://nodejs.org/"
    echo "  npm: Comes with Node.js"
    echo "  git: https://git-scm.com/"
    exit 1
else
    echo "✓ All prerequisites met"
    exit 0
fi
