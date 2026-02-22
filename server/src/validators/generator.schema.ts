import { z } from "zod";

export const applicationTypeSchema = z.enum([
  "angular",
  "react-ts",
  "react-js",
  "vue-ts",
  "vue-js",
]);

export const toolingSchema = z.enum([
  "prettier",
  "stylelint",
  "husky",
  "commitlint",
]);

const dependencyNamePattern =
  /^(?:@[a-z0-9-~][\w.-]*\/)?[a-z0-9-~][\w.-]*$/i;

const dependencyArraySchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Dependency name is required")
      .max(214, "Dependency name too long")
      .regex(dependencyNamePattern, "Invalid npm package name")
  )
  .max(100, "Too many dependencies")
  .transform((values) => Array.from(new Set(values)));

export const generatorRequestSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(3, "workspaceName must be at least 3 characters")
    .max(60, "workspaceName must be less than 60 characters")
    .regex(
      /^[a-z0-9][a-z0-9-_]*$/i,
      "workspaceName can contain letters, numbers, hyphens and underscores"
    ),
  applicationType: applicationTypeSchema,
  tooling: z.array(toolingSchema).default([]),
  dependencies: dependencyArraySchema.default([]),
  devDependencies: dependencyArraySchema.default([]),
});

export type GeneratorRequest = z.infer<typeof generatorRequestSchema>;
