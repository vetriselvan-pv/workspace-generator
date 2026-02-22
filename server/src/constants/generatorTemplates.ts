import type { GeneratorRequest } from "../validators/generator.schema.js";

type TemplateConfig = {
  displayName: string;
  scripts: Record<string, string>;
  baseDependencies: string[];
  baseDevDependencies: string[];
  files: Record<string, string>;
};

type BaseApplicationType = GeneratorRequest["applicationType"];

const baseGitIgnore = `node_modules
dist
.env
`;

const baseReadme = (
  displayName: string,
  workspaceName: string
): string => `# ${workspaceName}

Generated workspace for ${displayName}.

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
`;

const templateConfigMap: Record<BaseApplicationType, TemplateConfig> =
  {
    "angular": {
      displayName: "Angular",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      baseDependencies: [
        "@angular/common",
        "@angular/core",
        "@angular/platform-browser",
      ],
      baseDevDependencies: ["@analogjs/vite-plugin-angular", "typescript", "vite"],
      files: {
        "src/main.ts": `console.log("Angular workspace ready");\n`,
      },
    },
    "react-ts": {
      displayName: "React TS",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      baseDependencies: ["react", "react-dom"],
      baseDevDependencies: ["@vitejs/plugin-react", "typescript", "vite"],
      files: {
        "src/main.tsx": `console.log("React workspace ready");\n`,
      },
    },
    "react-js": {
      displayName: "React JS",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      baseDependencies: ["react", "react-dom"],
      baseDevDependencies: ["@vitejs/plugin-react", "vite"],
      files: {
        "src/main.jsx": `console.log("React JS workspace ready");\n`,
      },
    },
    "vue-ts": {
      displayName: "Vue TS",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      baseDependencies: ["vue"],
      baseDevDependencies: ["@vitejs/plugin-vue", "typescript", "vite"],
      files: {
        "src/main.ts": `console.log("Vue workspace ready");\n`,
      },
    },
    "vue-js": {
      displayName: "Vue JS",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      baseDependencies: ["vue"],
      baseDevDependencies: ["@vitejs/plugin-vue", "vite"],
      files: {
        "src/main.js": `console.log("Vue JS workspace ready");\n`,
      },
    },
  };

const withVersions = (deps: string[]): Record<string, string> =>
  Object.fromEntries(deps.map((dep) => [dep, "latest"]));

export const buildWorkspaceFiles = (input: GeneratorRequest) => {
  const template = templateConfigMap[input.applicationType];
  const dependencies = Array.from(
    new Set([...template.baseDependencies, ...input.dependencies])
  );
  const devDependencies = Array.from(
    new Set([...template.baseDevDependencies, ...input.devDependencies])
  );

  const packageJson = {
    name: input.workspaceName,
    version: "1.0.0",
    private: true,
    scripts: template.scripts,
    dependencies: withVersions(dependencies),
    devDependencies: withVersions(devDependencies),
  };

  return {
    displayName: template.displayName,
    files: {
      "package.json": JSON.stringify(packageJson, null, 2) + "\n",
      "README.md": baseReadme(template.displayName, input.workspaceName),
      ".gitignore": baseGitIgnore,
      ...template.files,
    },
    packageJson,
  };
};
