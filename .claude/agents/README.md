# Code Review Agents

This folder contains LLM agent prompts for ensuring enterprise-grade code quality in this vanilla JavaScript frontend dashboard. Each agent specializes in a different aspect of code quality.

## Project Context

This is a **vanilla JavaScript frontend** with:
- No build tools - pure HTML/CSS/JavaScript with Chart.js via CDN
- ES6 modules (`import`/`export`)
- Optional ASP.NET WebForms backend (C#) for Netvisor integration
- Python FastAPI backend integration (separate repo)

## Quick Start

### Full Codebase Sweep (Initial Assessment)
```
Use orchestrator.md with:
  Review Mode: full
  Agents: all
```

### Pre-Commit Review (Default)
```
Use orchestrator.md with:
  Review Mode: changed
  Agents: software_architect, cybersecurity_engineer, developer_experience
```

## Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| **Orchestrator** | `orchestrator.md` | Coordinates reviews, manages scope (full/changed/branch) |
| Software Architect | `software_architect.md` | Architectural consistency, SOLID principles, design patterns |
| Cybersecurity Engineer | `cybersecurity_engineer.md` | OWASP Top 10, secure coding, vulnerability detection |
| Data Privacy Engineer | `data_privacy_engineer.md` | GDPR, CCPA, PCI-DSS compliance, data protection |
| Performance Engineer | `performance_engineer.md` | Algorithmic efficiency, scalability, resource management |
| QA & Test Engineer | `qa_test_engineer.md` | Test coverage, test quality, test design |
| Technical Writer | `technical_writer.md` | Documentation, docstrings, API docs, LLM readability |
| Developer Experience | `developer_experience.md` | Code clarity, error messages, testability, maintainability |
| Error Handling Engineer | `error_handling_engineer.md` | Input validation, exception handling, graceful degradation |

## Review Modes

The orchestrator supports multiple review modes:

| Mode | Scope | Use Case |
|------|-------|----------|
| `full` | Entire codebase | Initial takeover, audits, pre-release |
| `changed` | Git diff (unstaged + staged) | Pre-commit reviews |
| `staged` | Git staged files only | Final pre-commit check |
| `branch` | All changes since branching from main | PR reviews |
| `path` | Specific files/directories | Targeted reviews |

## Usage

### Manual Review

To run a specific agent review, provide the agent prompt along with the changed files:

```bash
# Get list of changed files
git diff --name-only HEAD

# Then ask the LLM to review using the specific agent prompt
```

### Recommended Review Order

For comprehensive pre-commit review, run agents in this order:

1. **Software Architect** - Catch structural issues first
2. **Cybersecurity Engineer** - Identify security vulnerabilities
3. **QA & Test Engineer** - Verify test coverage
4. **Data Privacy Engineer** - Ensure compliance (if handling personal data)
5. **Performance Engineer** - Catch performance bottlenecks
6. **Technical Writer** - Ensure documentation is complete
7. **Developer Experience** - Final polish for maintainability

### Quick Review (Minimal)

For smaller changes, at minimum run:
1. **Software Architect** - Structural integrity
2. **Cybersecurity Engineer** - Security check
3. **QA & Test Engineer** - Test coverage

## Key Principles

### Scope Limitation

All agents are instructed to **only review changed files**. This ensures:
- Pull requests stay focused
- Review feedback is actionable
- Unrelated code isn't touched
- Reviews complete quickly

### Severity Levels

All agents use consistent severity levels:

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL/MUST FIX | Blocking issue | Must address before commit |
| HIGH/SHOULD FIX | Important issue | Should address before merge |
| MEDIUM/CONSIDER | Improvement | Optional but recommended |
| LOW/OBSERVATION | Minor suggestion | Nice to have |

### Output Format

All agents produce structured output with:
- Files reviewed
- Overall assessment
- Categorized findings by severity
- Positive patterns observed

## Customization

These agents are designed to be project-agnostic. To customize for your project:

1. Agents automatically read `docs/` folder for project-specific context
2. Agents read `CLAUDE.md` or `README.md` for conventions
3. Add project-specific rules to individual agent files as needed

## Frontend-Specific Considerations

Since this is a vanilla JS frontend:
- **No automated tests** - QA agent focuses on manual testing checklists and browser compatibility
- **Client-side security** - Focus on XSS, data exposure, API key handling
- **Performance** - DOM manipulation, rendering, bundle size, network requests
- **Browser compatibility** - ES6+ features require modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

## Integration with CLAUDE.md

Add the following to your project's `CLAUDE.md` to automatically trigger reviews before commits:

```markdown
## Pre-Commit Review Process

Before creating any git commit, run the review agents against changed files:

1. Get the list of changed files: `git diff --name-only`
2. Read and apply each agent from `agents/` folder to the changed files
3. Address any CRITICAL or HIGH severity issues before committing
4. Document any intentionally deferred items
```

## Adding New Agents

To add a new review agent:

1. Create a new `.md` file in this folder
2. Follow the structure of existing agents:
   - Clear role definition
   - Scope limitation to changed files
   - Pre-review steps (read docs, understand context)
   - Detailed checklist
   - Structured output format
   - Severity guidelines
   - What NOT to do section
3. Update this README with the new agent
4. Update CLAUDE.md if the agent should be run automatically
