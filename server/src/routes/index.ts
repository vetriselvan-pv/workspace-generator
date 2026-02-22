import { Router } from "express";
import { generatorRouter } from "./generator.routes.js";

export const apiRouter = Router();

apiRouter.use("/generator", generatorRouter);

