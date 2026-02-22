export type ApplicationType =
  | 'angular'
  | 'react-ts'
  | 'react-js'
  | 'vue-ts'
  | 'vue-js'

export type ToolingOption = 'prettier' | 'stylelint' | 'husky' | 'commitlint'

export interface FormValues {
  applicationName: string
  applicationType: ApplicationType
  tooling: ToolingOption[]
  extraDevDependencies: string[]
  extraDependencies: string[]
}

export interface PackageSelection {
  name: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}

export interface ApplicationOption {
  value: ApplicationType
  label: string
  logoSrc: string
  logoAlt: string
}

export interface ToolingPreset {
  value: ToolingOption
  label: string
  description: string
}

export interface NpmSearchItem {
  name: string
  version: string
  description: string
}

export interface GenerateWorkspaceRequest {
  workspaceName: string
  applicationType: ApplicationType
  tooling: ToolingOption[]
  dependencies: string[]
  devDependencies: string[]
}

export interface GenerateWorkspaceDownload {
  fileBlob: Blob
  fileName: string
  workspaceId: string
  framework: string
  generationMode: string
}
