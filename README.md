# Template Mobile App

A production-ready React Native + Expo template for building cross-platform mobile applications. Features TypeScript, file-based routing, Zustand state management, and comprehensive testing setup.

## Features

- **React Native + Expo** - Cross-platform mobile development
- **TypeScript** - Strict mode enabled
- **Expo Router** - File-based routing (like Next.js)
- **Zustand** - Lightweight state management with persistence
- **Pre-configured Testing** - Jest + React Testing Library
- **Code Quality** - ESLint, Prettier, pre-commit hooks
- **Production Ready** - Error boundaries, secure storage, API client

## Quick Start

```bash
# Clone the repository
git clone https://github.com/visma-allan-nevala/template-mobile-app.git
cd template-mobile-app

# Run initial setup
make setup

# Start development server
make dev
```

Open the Expo Go app on your phone and scan the QR code, or press `w` to open in web browser.

## Project Structure

```
template-mobile-app/
├── app/                    # Screens (file-based routing)
│   ├── _layout.tsx         # Root layout
│   ├── (auth)/             # Auth screens
│   └── (tabs)/             # Tab navigation
├── src/
│   ├── components/         # Reusable UI components
│   ├── core/               # Config, theme, constants
│   ├── services/           # Business logic
│   ├── api/                # API client
│   ├── store/              # Zustand stores
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilities
├── tests/                  # Test suite
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Development Commands

```bash
make setup         # Initial setup (install deps, pre-commit)
make dev           # Start Expo dev server
make dev-web       # Web browser only
make check         # Lint + typecheck
make test          # Run all tests
make test-cov      # Tests with coverage
make lint-fix      # Auto-fix lint issues
make format        # Format with Prettier
```

## Using This Template

1. **Clone and rename**:
   ```bash
   git clone https://github.com/visma-allan-nevala/template-mobile-app.git my-app
   cd my-app
   ./scripts/init.sh
   ```

2. **Update app.json** with your app name and bundle ID

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start building!**

## Documentation

- [CLAUDE.md](./CLAUDE.md) - LLM instructions and quick reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Development guide
- [tests/README.md](./tests/README.md) - Testing guide

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Expo](https://expo.dev) | React Native framework |
| [Expo Router](https://expo.github.io/router) | File-based routing |
| [Zustand](https://zustand-demo.pmnd.rs) | State management |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Jest](https://jestjs.io) | Testing framework |
| [ESLint](https://eslint.org) | Code linting |
| [Prettier](https://prettier.io) | Code formatting |

## Requirements

- Node.js 20+
- npm or yarn
- Expo Go app (for mobile testing) or Xcode/Android Studio (for simulators)

## License

MIT
