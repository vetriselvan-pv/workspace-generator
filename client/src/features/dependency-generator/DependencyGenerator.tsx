import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import workspaceGeneratorLogo from '../../assets/workspace-generator-logo.svg'
import Toast from '../../components/Toast'
import DependencySearchSelect from './components/DependencySearchSelect'
import {
  appTypeDependencies,
  appTypeOptions,
  toolingDevDependencyVersions,
  toolingPackageMap,
  toolingPresets,
} from './constants/dependency.constants'
import type { FormValues } from './model/dependency.interface'
import { generateWorkspaceFromApi } from './services/workspaceGeneratorApi.service'
import { buildDependencyPreview } from './utils/dependency.utils'

function DependencyGenerator() {
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      applicationName: '',
      applicationType: 'react-ts',
      tooling: [],
      extraDevDependencies: [],
      extraDependencies: [],
    },
  })

  const applicationName = useWatch({
    control,
    name: 'applicationName',
  })
  const selectedAppType = useWatch({
    control,
    name: 'applicationType',
  })
  const extraDevDependencies = useWatch({
    control,
    name: 'extraDevDependencies',
  })
  const extraDependencies = useWatch({
    control,
    name: 'extraDependencies',
  })
  const selectedTooling = useWatch({
    control,
    name: 'tooling',
  })

  const dependencyPreview = useMemo(() => {
    return buildDependencyPreview(
      selectedAppType,
      extraDependencies,
      extraDevDependencies,
    )
  }, [selectedAppType, extraDependencies, extraDevDependencies])

  const packageJsonPreview = useMemo(
    () => {
      const dependencies = { ...appTypeDependencies[selectedAppType].dependencies }
      extraDependencies.forEach((dep) => {
        if (!dependencies[dep]) {
          dependencies[dep] = 'latest'
        }
      })

      const devDependencies = { ...appTypeDependencies[selectedAppType].devDependencies }
      selectedTooling.forEach((tool) => {
        ;(toolingPackageMap[tool] ?? []).forEach((pkg) => {
          devDependencies[pkg] = toolingDevDependencyVersions[pkg] ?? 'latest'
        })
      })
      extraDevDependencies.forEach((dep) => {
        if (!devDependencies[dep]) {
          devDependencies[dep] = 'latest'
        }
      })

      return {
        dependencies,
        devDependencies,
      }
    },
    [selectedAppType, extraDependencies, extraDevDependencies, selectedTooling],
  )

  const normalizedWorkspaceName = useMemo(() => {
    const normalized = applicationName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')

    return normalized.length > 0 ? normalized : `${selectedAppType}-workspace`
  }, [applicationName, selectedAppType])

  const workspaceExport = useMemo(
    () => ({
      workspaceName: normalizedWorkspaceName, 
      framework: dependencyPreview.appName,
      packageJson: packageJsonPreview,
      generatedAt: new Date().toISOString(),
    }),
    [dependencyPreview.appName, normalizedWorkspaceName, packageJsonPreview],
  )

  const onSubmit = async (values: FormValues): Promise<void> => {
    setIsDownloading(true)
    setDownloadProgress(0)
    setDownloadError(null)

    for (let progress = 10; progress <= 60; progress += 10) {
      setDownloadProgress(progress)
      await new Promise((resolve) => {
        window.setTimeout(resolve, 80)
      })
    }

    try {
      const response = await generateWorkspaceFromApi({
        workspaceName: normalizedWorkspaceName,
        applicationType: values.applicationType,
        tooling: values.tooling,
        dependencies: values.extraDependencies,
        devDependencies: values.extraDevDependencies,
      })

      setDownloadProgress(80)
      await new Promise((resolve) => {
        window.setTimeout(resolve, 120)
      })

      setSubmittedData(values)

      const url = URL.createObjectURL(response.fileBlob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = response.fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      setDownloadProgress(100)
      setToastMessage('Please unzip the folder and run npm install. Happy coding!')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Workspace generation failed. Please try again.'
      setDownloadError(message)
      setDownloadProgress(0)
    } finally {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 250)
      })
      setIsDownloading(false)
    }
  }

  return (
    <main className="layout">
      <Toast
        message={toastMessage ?? ''}
        isVisible={Boolean(toastMessage)}
        onClose={() => {
          setToastMessage(null)
        }}
      />

      <section className="panel form-panel">
        <div className="title-row">
          <img
            src={workspaceGeneratorLogo}
            alt="Workspace Generator logo"
            className="app-brand-logo"
          />
          <h1>Workspace Dependency Generator</h1>
        </div>
        <p className="subtitle">
          Select an application type and add additional package names.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <label className="field">
            <span>Application Name</span>
            <input
              type="text"
              placeholder="angular studio"
              {...register('applicationName')}
            />
            <small className="input-hint">
              Spaces will be replaced with hyphen. Example: angular studio -&gt; angular-studio
            </small>
            <small className="input-hint">
              Generated workspace name: {normalizedWorkspaceName}
            </small>
          </label>

          <div className="field">
            <span>Application Type</span>
            <div className="app-type-grid">
              {appTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`app-type-card ${
                    selectedAppType === option.value ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('applicationType')}
                    className="app-type-radio"
                  />
                  <img
                    src={option.logoSrc}
                    alt={option.logoAlt}
                    className="app-type-logo"
                  />
                  <span className="app-type-label">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field">
            <span>Automation Tooling</span>
            <div className="tooling-grid">
              {toolingPresets.map((tool) => (
                <label key={tool.value} className="tooling-card">
                  <input
                    type="checkbox"
                    value={tool.value}
                    {...register('tooling')}
                  />
                  <div>
                    <strong>{tool.label}</strong>
                    <p>{tool.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Controller
            name="extraDependencies"
            control={control}
            render={({ field }) => (
              <DependencySearchSelect
                label="Additional Dependencies"
                placeholder="Search npm packages (e.g. axios)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="extraDevDependencies"
            control={control}
            render={({ field }) => (
              <DependencySearchSelect
                label="Additional Dev Dependencies"
                placeholder="Search npm packages (e.g. stylelint)"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <button type="submit" disabled={isDownloading}>
            {isDownloading
              ? `Downloading... ${downloadProgress}%`
              : 'Download Workspace'}
          </button>
        </form>

        {isDownloading ? (
          <div className="download-progress">
            <div
              className="download-progress-fill"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        ) : null}

        {submittedData ? (
          <p className="submit-message">
            Downloaded for:{' '}
            {appTypeDependencies[submittedData.applicationType].name}
          </p>
        ) : null}

        {downloadError ? <p className="download-error">{downloadError}</p> : null}
      </section>

      <section className="panel preview-panel">
        <div className="preview-header">
          <h2>Workspace Config Preview</h2>
          <p>{dependencyPreview.appName}</p>
        </div>

        <pre>
          <code>{JSON.stringify(workspaceExport, null, 2)}</code>
        </pre>

        <div className="preview-lists">
          <div>
            <h3>Dependencies</h3>
            <ul>
              {dependencyPreview.dependencies.map((dep) => (
                <li key={dep}>{dep}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Dev Dependencies</h3>
            <ul>
              {dependencyPreview.devDependencies.map((dep) => (
                <li key={dep}>{dep}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

export default DependencyGenerator
