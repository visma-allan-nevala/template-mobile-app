.PHONY: setup dev dev-web test test-cov check lint lint-fix format clean help

# Default target
help:
	@echo "Template Mobile App - Available Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make setup       Install dependencies and pre-commit hooks"
	@echo ""
	@echo "Development:"
	@echo "  make dev         Start Expo dev server (all platforms)"
	@echo "  make dev-web     Start Expo dev server (web only)"
	@echo ""
	@echo "Testing:"
	@echo "  make test        Run all tests"
	@echo "  make test-cov    Run tests with coverage"
	@echo ""
	@echo "Code Quality:"
	@echo "  make check       Run lint and typecheck"
	@echo "  make lint        Run ESLint"
	@echo "  make lint-fix    Run ESLint with auto-fix"
	@echo "  make format      Format code with Prettier"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean       Remove build artifacts"

# Setup
setup:
	@echo "Installing dependencies..."
	npm install
	@echo "Installing pre-commit hooks..."
	pre-commit install || echo "pre-commit not installed, skipping hooks"
	@echo ""
	@echo "Setup complete! Run 'make dev' to start development."

# Development
dev:
	npx expo start

dev-web:
	npx expo start --web

# Testing
test:
	npm test

test-cov:
	npm run test:coverage

# Code Quality
check:
	npm run lint
	npm run typecheck

lint:
	npm run lint

lint-fix:
	npm run lint:fix

format:
	npm run format

# Maintenance
clean:
	rm -rf node_modules
	rm -rf .expo
	rm -rf dist
	rm -rf web-build
	rm -rf coverage
	rm -rf .turbo
