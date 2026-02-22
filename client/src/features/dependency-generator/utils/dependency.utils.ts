import { appTypeDependencies } from '../constants/dependency.constants'
import type { ApplicationType } from '../model/dependency.interface'

export const buildDependencyPreview = (
  applicationType: ApplicationType,
  extraDependencies: string[],
  extraDevDependencies: string[],
) => {
  const selectedConfig = appTypeDependencies[applicationType]
  const baseDependencyNames = Object.keys(selectedConfig.dependencies)
  const baseDevDependencyNames = Object.keys(selectedConfig.devDependencies)

  return {
    appName: selectedConfig.name,
    dependencies: [...baseDependencyNames, ...extraDependencies],
    devDependencies: [...baseDevDependencyNames, ...extraDevDependencies],
  }
}
