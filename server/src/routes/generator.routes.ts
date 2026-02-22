import { Router } from "express";
import { generateWorkspaceController } from "../controllers/generator.controller.js";

export const generatorRouter = Router();

generatorRouter.post("/workspace", generateWorkspaceController);

