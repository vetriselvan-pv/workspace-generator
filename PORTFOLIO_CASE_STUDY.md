# Workspace Generator Platform

## Overview
Workspace Generator is a full-stack developer automation platform that creates ready-to-run frontend workspaces from user input and delivers them as a downloadable zip.

Instead of manually setting up each project, users select framework options, tooling preferences, and extra dependencies through a clean UI. The backend then generates a customized workspace from framework templates, injects configuration files, and returns a production-ready starter package.

---

## The Problem
Setting up a new frontend project repeatedly is time-consuming and error-prone.

Common pain points:
- Repeating framework boilerplate setup
- Manually configuring code-quality tooling (Prettier, Stylelint, Husky, Commitlint)
- Inconsistent dependency versions across projects
- Forgetting important configuration and Git hook files

---

## The Solution
I built an end-to-end workspace generation system that automates project setup.

Users can:
- Choose project type: `angular`, `react-ts`, `react-js`, `vue-ts`, `vue-js`
- Enter application name with normalized workspace naming
- Add extra dependencies/devDependencies using searchable package selectors
- Enable optional tooling presets (`prettier`, `stylelint`, `husky`, `commitlint`)
- Download a generated workspace zip instantly

---

## Demo Flow
1. User fills form in React app.
2. Client sends generation request to Node/Express API.
3. Server picks template by `applicationType`.
4. Server customizes template files:
- updates `package.json` name and dependencies
- updates Angular project config (`angular.json`) when applicable
- updates page title in `index.html`
- injects tooling configs/scripts/hooks
5. Server streams back a zip file.
6. Server cleans up generated workspace directory after response.
7. Client shows success toast with next-step instructions.

---

## Architecture
### Frontend
- React + TypeScript
- React Hook Form for typed form orchestration
- Reusable components:
- searchable dependency selector
- reusable toast notification

### Backend
- Node.js + Express + TypeScript
- Zod request schema validation
- Template-based generation from `server/src/templates/*`
- Zip streaming response API
- Post-response cleanup of generated directories

### Development Experience
- VS Code run/debug configuration for server
- Layered server structure (controllers, services, validators, middleware)
- Strong typing across client/server contracts

---

## Key Features
- Template-driven multi-framework generation
- Hardcoded baseline dependency versions from template `package.json` files
- Optional automation tooling provisioning:
- Prettier config and scripts
- Stylelint config and scripts
- Husky hooks
- Commitlint config and command wiring
- Download progress UI
- Clean success feedback via reusable toast
- Server-side cleanup after zip generation

---

## My Contributions
- Designed and implemented the full product workflow from UI to downloadable artifact.
- Built the API contract and validation layer for safe and predictable generation.
- Implemented framework template mapping and dynamic configuration patching.
- Added tooling automation setup logic and generated config files.
- Integrated zip download response handling on client and server.
- Refactored project into clean, scalable folder structures.

---

## Engineering Decisions
- **Template-first generation** for consistency and deterministic outputs.
- **Typed request/response models** to reduce runtime integration issues.
- **Server-side zip creation + cleanup** to optimize UX and avoid storage bloat.
- **Preset-based tooling** to balance flexibility with opinionated defaults.

---

## Challenges and Solutions
- **Challenge:** Environment-specific CLI/cache/debugger issues during generation.
- **Solution:** Moved to template-driven generation with stable server-side file customization.

- **Challenge:** Keeping dependency previews accurate and consistent.
- **Solution:** Used template package versions as source of truth for baseline dependencies.

- **Challenge:** Avoiding fragile one-off UI logic.
- **Solution:** Introduced reusable components (dependency selector, toast) and strict form typing.

---

## Impact
- Reduced project bootstrap effort from manual multi-step setup to a guided form + one download.
- Improved consistency of generated projects across frameworks and teams.
- Embedded quality tooling at project creation time, shifting best practices left.

---

## Next Improvements
- Add unit/integration tests for generation service and API contract.
- Add CI validation for template integrity.
- Add downloadable metadata manifest and generation logs.
- Add authenticated user workspaces and generation history dashboard.

---

## Resume/Portfolio One-Liner
Built a full-stack template-driven workspace generator (React + Node/Express + TypeScript) that automates multi-framework project scaffolding, quality tooling setup, and one-click zip delivery with post-generation cleanup.

