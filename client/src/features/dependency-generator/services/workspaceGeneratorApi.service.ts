import type {
  GenerateWorkspaceDownload,
  GenerateWorkspaceRequest,
} from '../model/dependency.interface'

const DEFAULT_API_BASE_URL = 'http://localhost:4000'

const getApiBaseUrl = (): string =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  DEFAULT_API_BASE_URL

export const generateWorkspaceFromApi = async (
  payload: GenerateWorkspaceRequest,
): Promise<GenerateWorkspaceDownload> => {
  const response = await fetch(
    `${getApiBaseUrl()}/api/v1/generator/workspace`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    const fallbackMessage = 'Failed to generate workspace from API'
    try {
      const errorBody = (await response.json()) as { message?: string }
      throw new Error(errorBody.message ?? fallbackMessage)
    } catch {
      throw new Error(fallbackMessage)
    }
  }

  const contentDisposition = response.headers.get('content-disposition') ?? ''
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
  const fileName = filenameMatch?.[1] ?? `${payload.workspaceName}.zip`
  const workspaceId =
    response.headers.get('x-workspace-id') ?? payload.workspaceName
  const framework = response.headers.get('x-workspace-framework') ?? ''
  const generationMode = response.headers.get('x-generation-mode') ?? ''

  return {
    fileBlob: await response.blob(),
    fileName,
    workspaceId,
    framework,
    generationMode,
  }
}
