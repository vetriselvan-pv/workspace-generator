import type {
  ApplicationOption,
  ApplicationType,
  PackageSelection,
  ToolingPreset,
} from "../model/dependency.interface";

export const appTypeDependencies: Record<ApplicationType, PackageSelection> = {
  angular: {
    name: "Angular",
    dependencies: {
      "@angular/common": "^21.1.0",
      "@angular/compiler": "^21.1.0",
      "@angular/core": "^21.1.0",
      "@angular/forms": "^21.1.0",
      "@angular/platform-browser": "^21.1.0",
      "@angular/router": "^21.1.0",
      rxjs: "~7.8.0",
      tslib: "^2.3.0",
    },
    devDependencies: {
      "@angular/build": "^21.1.4",
      "@angular/cli": "^21.1.4",
      "@angular/compiler-cli": "^21.1.0",
      jsdom: "^27.1.0",
      typescript: "~5.9.2",
      vitest: "^4.0.8",
    },
  },
  "react-ts": {
    name: "React (TypeScript)",
    dependencies: {
      react: "^19.2.0",
      "react-dom": "^19.2.0",
    },
    devDependencies: {
      "@eslint/js": "^9.39.1",
      "@types/node": "^24.10.1",
      "@types/react": "^19.2.7",
      "@types/react-dom": "^19.2.3",
      "@vitejs/plugin-react": "^5.1.1",
      eslint: "^9.39.1",
      "eslint-plugin-react-hooks": "^7.0.1",
      "eslint-plugin-react-refresh": "^0.4.24",
      globals: "^16.5.0",
      typescript: "~5.9.3",
      "typescript-eslint": "^8.48.0",
      vite: "^7.3.1",
    },
  },
  "react-js": {
    name: "React (JavaScript)",
    dependencies: {
      react: "^19.2.0",
      "react-dom": "^19.2.0",
    },
    devDependencies: {
      "@eslint/js": "^9.39.1",
      "@types/react": "^19.2.7",
      "@types/react-dom": "^19.2.3",
      "@vitejs/plugin-react": "^5.1.1",
      eslint: "^9.39.1",
      "eslint-plugin-react-hooks": "^7.0.1",
      "eslint-plugin-react-refresh": "^0.4.24",
      globals: "^16.5.0",
      vite: "^7.3.1",
    },
  },
  "vue-ts": {
    name: "Vue (TypeScript)",
    dependencies: {
      vue: "^3.5.25",
    },
    devDependencies: {
      "@types/node": "^24.10.1",
      "@vitejs/plugin-vue": "^6.0.2",
      "@vue/tsconfig": "^0.8.1",
      typescript: "~5.9.3",
      vite: "^7.3.1",
      "vue-tsc": "^3.1.5",
    },
  },
  "vue-js": {
    name: "Vue (JavaScript)",
    dependencies: {
      vue: "^3.5.25",
    },
    devDependencies: {
      "@vitejs/plugin-vue": "^6.0.2",
      vite: "^7.3.1",
    },
  },
};

export const appTypeOptions: ApplicationOption[] = [
  {
    value: "angular",
    label: "Angular",
    logoSrc:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg",
    logoAlt: "Angular logo",
  },
  {
    value: "react-ts",
    label: "React TS",
    logoSrc:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    logoAlt: "React logo",
  },
  {
    value: "react-js",
    label: "React JS",
    logoSrc:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
    logoAlt: "React logo",
  },
  {
    value: "vue-ts",
    label: "Vue TS",
    logoSrc:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
    logoAlt: "Vue logo",
  },
  {
    value: "vue-js",
    label: "Vue JS",
    logoSrc:
      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
    logoAlt: "Vue logo",
  },
];

export const toolingPresets: ToolingPreset[] = [
  {
    value: "prettier",
    label: "Prettier",
    description: "Code formatting setup",
  },
  {
    value: "stylelint",
    label: "Stylelint",
    description: "CSS/SCSS/Vue style linting",
  },
  {
    value: "husky",
    label: "Husky",
    description: "Git hooks automation",
  },
  {
    value: "commitlint",
    label: "Commitlint",
    description: "Commit message linting",
  },
];

export const toolingDevDependencyVersions: Record<string, string> = {
  prettier: "^3.6.2",
  stylelint: "^16.24.0",
  "stylelint-config-standard-scss": "^15.0.1",
  postcss: "^8.5.6",
  "postcss-scss": "^4.0.9",
  "postcss-html": "^1.8.0",
  husky: "^9.1.7",
  "@commitlint/cli": "^19.8.1",
  "@commitlint/config-conventional": "^19.8.1",
};

export const toolingPackageMap: Record<string, string[]> = {
  prettier: ["prettier"],
  stylelint: [
    "stylelint",
    "stylelint-config-standard-scss",
    "postcss",
    "postcss-scss",
    "postcss-html",
  ],
  husky: ["husky"],
  commitlint: ["@commitlint/cli", "@commitlint/config-conventional"],
};
