import type { NpmSearchItem } from '../model/dependency.interface'

type NpmSearchResponse = {
  objects?: Array<{
    package?: {
      name?: string
      version?: string
      description?: string
    }
  }>
}

const SEARCH_ENDPOINT = 'https://registry.npmjs.org/-/v1/search?text='
const PACKAGE_ENDPOINT = 'https://registry.npmjs.org/'

type NpmPackageMetadata = {
  'dist-tags'?: {
    latest?: string
  }
}

export const searchNpmPackages = async (
  query: string,
  signal?: AbortSignal,
): Promise<NpmSearchItem[]> => {
  const response = await fetch(
    `${SEARCH_ENDPOINT}${encodeURIComponent(query.trim())}&size=10`,
    { signal },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch packages')
  }

  const data = (await response.json()) as NpmSearchResponse

  return (
    data.objects
      ?.map((item) => ({
        name: item.package?.name ?? '',
        version: item.package?.version ?? '',
        description: item.package?.description ?? '',
      }))
      .filter((item) => item.name.length > 0) ?? []
  )
}

export const getNpmLatestVersion = async (
  packageName: string,
  signal?: AbortSignal,
): Promise<string> => {
  const response = await fetch(
    `${PACKAGE_ENDPOINT}${encodeURIComponent(packageName)}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch version for ${packageName}`)
  }

  const data = (await response.json()) as NpmPackageMetadata
  return data['dist-tags']?.latest ?? 'unknown'
}
