import type { Request, Response, NextFunction } from "express";
import { rm } from "node:fs/promises";
import { generateWorkspace } from "../services/workspaceGenerator.service.js";
import { streamWorkspaceAsZip } from "../services/workspaceArchive.service.js";
import { generatorRequestSchema } from "../validators/generator.schema.js";

export const generateWorkspaceController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let generatedWorkspaceDirectory: string | null = null;

  try {
    const payload = generatorRequestSchema.parse(req.body);
    const result = await generateWorkspace(payload);
    generatedWorkspaceDirectory = result.workspaceDirectory;

    res.status(200);
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.workspaceId}.zip"`
    );
    res.setHeader("X-Workspace-Id", result.workspaceId);
    res.setHeader("X-Workspace-Framework", result.framework);
    res.setHeader("X-Generation-Mode", result.generationMode);

    await streamWorkspaceAsZip(
      result.workspaceDirectory,
      result.workspaceId,
      res
    );
  } catch (error) {
    next(error);
  } finally {
    if (generatedWorkspaceDirectory) {
      await rm(generatedWorkspaceDirectory, { recursive: true, force: true });
    }
  }
};
