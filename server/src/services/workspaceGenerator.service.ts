import path from "node:path";
import { cp, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { AppError } from "../errors/AppError.js";
import type { GeneratorRequest } from "../validators/generator.schema.js";

const GENERATED_WORKSPACES_DIR = path.resolve(
  process.cwd(),
  "generated-workspaces"
);
const TEMPLATE_ROOT_DIR = path.resolve(process.cwd(), "templates");

const sanitizeName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-");

const ensureDirectory = async (directoryPath: string): Promise<void> => {
  await mkdir(directoryPath, { recursive: true });
};

type TemplateApplicationType = GeneratorRequest["applicationType"];
type ToolingOption = GeneratorRequest["tooling"][number];

type TemplateGenerationConfig = {
  framework: string;
  templateCandidates: string[];
};

const toTitleCase = (value: string): string =>
  value
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const mergeDependencyMaps = (
  existing: Record<string, string> | undefined,
  additions: string[]
): Record<string, string> => {
  const merged = { ...(existing ?? {}) };
  additions.forEach((dependency) => {
    merged[dependency] = merged[dependency] ?? "latest";
  });
  return merged;
};

const mergeVersionedDependencyMaps = (
  existing: Record<string, string> | undefined,
  additions: Record<string, string>
): Record<string, string> => ({
  ...(existing ?? {}),
  ...additions,
});

const readWorkspacePackageJson = async (
  workspaceDirectory: string
): Promise<Record<string, unknown>> => {
  const packageJsonPath = path.join(workspaceDirectory, "package.json");
  const packageJsonRaw = await readFile(packageJsonPath, "utf8");
  const packageJson = JSON.parse(packageJsonRaw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };

  return packageJson;
};

const applyUserDependencies = async (
  packageJson: Record<string, unknown>,
  packageJsonPath: string,
  input: GeneratorRequest
): Promise<Record<string, unknown>> => {
  const safePackageJson = packageJson as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };

  safePackageJson.dependencies = mergeDependencyMaps(
    safePackageJson.dependencies,
    input.dependencies
  );
  safePackageJson.devDependencies = mergeDependencyMaps(
    safePackageJson.devDependencies,
    input.devDependencies
  );

  await writeFile(
    packageJsonPath,
    `${JSON.stringify(safePackageJson, null, 2)}\n`,
    "utf8"
  );

  return safePackageJson;
};

const pathExists = async (value: string): Promise<boolean> => {
  try {
    await stat(value);
    return true;
  } catch {
    return false;
  }
};

const toolingDevDependencyMap: Record<ToolingOption, Record<string, string>> = {
  prettier: {
    prettier: "^3.6.2",
  },
  stylelint: {
    stylelint: "^16.24.0",
    "stylelint-config-standard-scss": "^15.0.1",
    postcss: "^8.5.6",
    "postcss-scss": "^4.0.9",
    "postcss-html": "^1.8.0",
  },
  husky: {
    husky: "^9.1.7",
  },
  commitlint: {
    "@commitlint/cli": "^19.8.1",
    "@commitlint/config-conventional": "^19.8.1",
  },
};

const updatePackageScript = (
  scripts: Record<string, string> | undefined,
  key: string,
  value: string
): Record<string, string> => ({
  ...(scripts ?? {}),
  [key]: value,
});

const writeFileIfRequired = async (
  workspaceDirectory: string,
  relativePath: string,
  content: string
): Promise<void> => {
  const absolutePath = path.join(workspaceDirectory, relativePath);
  await ensureDirectory(path.dirname(absolutePath));
  await writeFile(absolutePath, content, "utf8");
};

const applyToolingSetup = async (
  workspaceDirectory: string,
  packageJson: Record<string, unknown>,
  tooling: ToolingOption[]
): Promise<Record<string, unknown>> => {
  const resultPackageJson = packageJson as {
    scripts?: Record<string, string>;
    devDependencies?: Record<string, string>;
    [key: string]: unknown;
  };

  for (const tool of tooling) {
    resultPackageJson.devDependencies = mergeVersionedDependencyMaps(
      resultPackageJson.devDependencies,
      toolingDevDependencyMap[tool]
    );
  }

  if (tooling.includes("prettier")) {
    resultPackageJson.scripts = updatePackageScript(
      resultPackageJson.scripts,
      "format",
      "prettier --write ."
    );
    resultPackageJson.scripts = updatePackageScript(
      resultPackageJson.scripts,
      "format:check",
      "prettier --check ."
    );
    await writeFileIfRequired(
      workspaceDirectory,
      ".prettierrc.json",
      `${JSON.stringify({ singleQuote: true, semi: false, trailingComma: "all" }, null, 2)}\n`
    );
    await writeFileIfRequired(
      workspaceDirectory,
      ".prettierignore",
      "node_modules\ndist\ncoverage\n.nuxt\n.next\n"
    );
  }

  if (tooling.includes("stylelint")) {
    resultPackageJson.scripts = updatePackageScript(
      resultPackageJson.scripts,
      "lint:styles",
      "stylelint \"**/*.{css,scss,vue}\""
    );
    await writeFileIfRequired(
      workspaceDirectory,
      ".stylelintrc.json",
      `${JSON.stringify(
        {
          extends: ["stylelint-config-standard-scss"],
          overrides: [{ files: ["**/*.vue"], customSyntax: "postcss-html" }],
        },
        null,
        2
      )}\n`
    );
  }

  if (tooling.includes("commitlint")) {
    resultPackageJson.scripts = updatePackageScript(
      resultPackageJson.scripts,
      "commitlint",
      "commitlint --from=HEAD~1"
    );
    await writeFileIfRequired(
      workspaceDirectory,
      "commitlint.config.cjs",
      "module.exports = { extends: ['@commitlint/config-conventional'] }\n"
    );
  }

  if (tooling.includes("husky")) {
    resultPackageJson.scripts = updatePackageScript(
      resultPackageJson.scripts,
      "prepare",
      "husky"
    );

    const preCommitCommands: string[] = [];
    if (tooling.includes("prettier")) {
      preCommitCommands.push("npm run format:check");
    }
    if (tooling.includes("stylelint")) {
      preCommitCommands.push("npm run lint:styles");
    }
    if (preCommitCommands.length === 0) {
      preCommitCommands.push("echo \"No pre-commit checks configured\"");
    }

    await writeFileIfRequired(
      workspaceDirectory,
      ".husky/pre-commit",
      `#!/usr/bin/env sh\n${preCommitCommands.join("\n")}\n`
    );

    if (tooling.includes("commitlint")) {
      await writeFileIfRequired(
        workspaceDirectory,
        ".husky/commit-msg",
        "#!/usr/bin/env sh\nnpx --no -- commitlint --edit \"$1\"\n"
      );
    }
  }

  return resultPackageJson;
};

const resolveTemplateDirectory = async (
  candidates: string[]
): Promise<string | null> => {
  for (const candidate of candidates) {
    const candidatePath = path.join(TEMPLATE_ROOT_DIR, candidate);
    if (await pathExists(candidatePath)) {
      return candidatePath;
    }
  }

  return null;
};

const replaceProjectNameReferences = (
  value: unknown,
  fromProjectName: string,
  toProjectName: string
): unknown => {
  if (typeof value === "string") {
    return value.replaceAll(`${fromProjectName}:`, `${toProjectName}:`);
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      replaceProjectNameReferences(item, fromProjectName, toProjectName)
    );
  }

  if (value !== null && typeof value === "object") {
    const updatedEntries = Object.entries(value as Record<string, unknown>).map(
      ([key, nestedValue]) => [
        key,
        replaceProjectNameReferences(nestedValue, fromProjectName, toProjectName),
      ]
    );

    return Object.fromEntries(updatedEntries);
  }

  return value;
};

const updateAngularProjectConfig = async (
  workspaceDirectory: string,
  workspaceProjectName: string
): Promise<void> => {
  const angularJsonPath = path.join(workspaceDirectory, "angular.json");
  if (!(await pathExists(angularJsonPath))) {
    return;
  }

  const angularJsonRaw = await readFile(angularJsonPath, "utf8");
  const angularJson = JSON.parse(angularJsonRaw) as {
    projects?: Record<string, unknown>;
    [key: string]: unknown;
  };

  const existingProjectName = Object.keys(angularJson.projects ?? {})[0];
  const existingProjectConfig =
    existingProjectName && angularJson.projects
      ? angularJson.projects[existingProjectName]
      : undefined;

  if (existingProjectName && existingProjectConfig && angularJson.projects) {
    delete angularJson.projects[existingProjectName];
    angularJson.projects[workspaceProjectName] = replaceProjectNameReferences(
      existingProjectConfig,
      existingProjectName,
      workspaceProjectName
    );
  }

  await writeFile(angularJsonPath, `${JSON.stringify(angularJson, null, 2)}\n`, "utf8");
};

const updateIndexHtmlTitleIfExists = async (
  workspaceDirectory: string,
  appTitle: string
): Promise<void> => {
  const indexHtmlCandidates = [
    path.join(workspaceDirectory, "src", "index.html"),
    path.join(workspaceDirectory, "index.html"),
  ];

  for (const indexHtmlPath of indexHtmlCandidates) {
    if (!(await pathExists(indexHtmlPath))) {
      continue;
    }

    const indexHtml = await readFile(indexHtmlPath, "utf8");
    const updatedIndexHtml = indexHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${appTitle}</title>`
    );
    await writeFile(indexHtmlPath, updatedIndexHtml, "utf8");
    break;
  }
};

const templateGenerationConfigMap: Record<TemplateApplicationType, TemplateGenerationConfig> = {
  angular: {
    framework: "Angular (Template)",
    templateCandidates: ["angular"],
  },
  "react-ts": {
    framework: "React TS (Template)",
    templateCandidates: ["react"],
  },
  "react-js": {
    framework: "React JS (Template)",
    templateCandidates: ["react-js"],
  },
  "vue-ts": {
    framework: "Vue TS (Template)",
    templateCandidates: ["vue"],
  },
  "vue-js": {
    framework: "Vue JS (Template)",
    templateCandidates: ["vue-js"],
  },
};

const buildWorkspaceFromTemplate = async (
  input: GeneratorRequest,
  workspaceDirectory: string
): Promise<{ framework: string; packageJson: Record<string, unknown> }> => {
  const config = templateGenerationConfigMap[input.applicationType];
  const resolvedTemplateDirectory = await resolveTemplateDirectory(
    config.templateCandidates
  );

  if (!resolvedTemplateDirectory) {
    throw new AppError(
      `Template not found for ${input.applicationType}. Expected one of: ${config.templateCandidates.join(
        ", "
      )}`,
      500
    );
  }

  await cp(resolvedTemplateDirectory, workspaceDirectory, { recursive: true });

  const workspaceProjectName = sanitizeName(input.workspaceName);
  await updateAngularProjectConfig(workspaceDirectory, workspaceProjectName);

  const appTitle = toTitleCase(input.workspaceName);
  await updateIndexHtmlTitleIfExists(workspaceDirectory, appTitle);

  const packageJsonPath = path.join(workspaceDirectory, "package.json");
  if (!(await pathExists(packageJsonPath))) {
    throw new AppError(
      `Template ${path.basename(
        resolvedTemplateDirectory
      )} is missing package.json`,
      500
    );
  }

  const packageJson = await readWorkspacePackageJson(workspaceDirectory);
  const packageJsonWithName = {
    ...packageJson,
    name: workspaceProjectName,
  };
  const packageJsonWithTooling = await applyToolingSetup(
    workspaceDirectory,
    packageJsonWithName,
    input.tooling
  );
  const updatedPackageJson = await applyUserDependencies(
    packageJsonWithTooling,
    packageJsonPath,
    input
  );

  return {
    framework: config.framework,
    packageJson: updatedPackageJson,
  };
};

export const generateWorkspace = async (input: GeneratorRequest) => {
  const workspaceId = `${sanitizeName(input.workspaceName)}-${Date.now()}`;
  const workspaceDirectory = path.join(GENERATED_WORKSPACES_DIR, workspaceId);
  await ensureDirectory(GENERATED_WORKSPACES_DIR);
  await ensureDirectory(workspaceDirectory);

  try {
    const templateWorkspace = await buildWorkspaceFromTemplate(
      input,
      workspaceDirectory
    );
    return {
      workspaceId,
      workspaceDirectory,
      framework: templateWorkspace.framework,
      packageJson: templateWorkspace.packageJson,
      generationMode: "template",
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown template error";
    throw new AppError(
      `Template generation failed for ${input.applicationType}: ${reason}`,
      500
    );
  }
};
