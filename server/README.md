# Workspace Generator Server

Node.js + Express API that generates framework workspaces from user input.

## Setup

```bash
npm install
npm run dev
```

Server runs at `http://localhost:4000` by default.

## API

### Health

`GET /health`

### Generate Workspace

`POST /api/v1/generator/workspace`

Request body:

```json
{
  "workspaceName": "my-app",
  "applicationType": "react-ts",
  "tooling": ["prettier", "stylelint", "husky", "commitlint"],
  "dependencies": ["axios"],
  "devDependencies": ["prettier", "husky"]
}
```

Response:

The API responds with a downloadable `.zip` file (`Content-Type: application/zip`) containing the generated workspace.

Headers:

- `Content-Disposition`: attachment filename
- `X-Workspace-Id`: generated workspace id
- `X-Workspace-Framework`: framework label
- `X-Generation-Mode`: `template` or `cli`

Error response example:

```json
{
  "message": "Workspace generation failed: <reason>"
}
```

## Notes

- Generation uses local templates from `server/src/templates` based on `applicationType`.
- Optional tooling provisioning is supported via `tooling` array:
  - `prettier`
  - `stylelint`
  - `husky`
  - `commitlint`
- Angular template customization:
  - Replaces project key references in `angular.json`
  - Replaces `<title>` in `src/index.html`
- For all templates, server updates `package.json` name + merges API dependencies/devDependencies.
- Selected tooling adds dependencies/scripts/config files/hooks (as applicable).
- Supported application types:
  - `angular`
  - `react-ts`
  - `react-js`
  - `vue-ts`
  - `vue-js`
