import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Writable } from "node:stream";

const runZipCommand = async (
  workspaceDirectory: string,
  zipFilePath: string
): Promise<void> => {
  const workspaceParent = path.dirname(workspaceDirectory);
  const workspaceFolder = path.basename(workspaceDirectory);

  await new Promise<void>((resolve, reject) => {
    const child = spawn("zip", ["-rq", zipFilePath, workspaceFolder], {
      cwd: workspaceParent,
      stdio: "pipe",
      shell: false,
    });
    let stderr = "";

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(stderr || `zip command failed with exit code ${code}`));
    });
  });
};

export const streamWorkspaceAsZip = async (
  workspaceDirectory: string,
  workspaceFolderName: string,
  output: Writable
): Promise<void> => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "workspace-archive-"));
  const zipFilePath = path.join(tempRoot, `${workspaceFolderName}.zip`);

  try {
    await runZipCommand(workspaceDirectory, zipFilePath);
    const zipStream = createReadStream(zipFilePath);
    await pipeline(zipStream, output);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
};

