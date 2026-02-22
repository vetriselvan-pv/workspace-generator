import { useEffect, useRef, useState } from 'react'
import type { NpmSearchItem } from '../model/dependency.interface'
import { searchNpmPackages } from '../services/npmRegistry.service'

type DependencySearchSelectProps = {
  label: string
  placeholder: string
  value: string[]
  onChange: (value: string[]) => void
}

function DependencySearchSelect({
  label,
  placeholder,
  value,
  onChange,
}: DependencySearchSelectProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NpmSearchItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const debounce = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const packages = await searchNpmPackages(query, controller.signal)
        setResults(packages)
      } catch (fetchError) {
        if (
          fetchError instanceof DOMException &&
          fetchError.name === 'AbortError'
        ) {
          return
        }

        setError('Unable to fetch npm packages.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(debounce)
    }
  }, [query])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) {
        return
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  const addPackage = (packageName: string) => {
    const normalized = packageName.trim()
    if (!normalized || value.includes(normalized)) {
      setQuery('')
      setIsOpen(false)
      return
    }

    onChange([...value, normalized])
    setQuery('')
    setIsOpen(false)
  }

  const removePackage = (packageName: string) => {
    onChange(value.filter((pkg) => pkg !== packageName))
  }

  return (
    <div
      className="field dependency-field"
      ref={containerRef}
      onBlurCapture={() => {
        window.setTimeout(() => {
          if (!containerRef.current) {
            return
          }

          const activeElement = document.activeElement
          if (activeElement && !containerRef.current.contains(activeElement)) {
            setIsOpen(false)
          }
        }, 0)
      }}
    >
      <span>{label}</span>
      <div className="dependency-select">
        <div className="dependency-chip-list">
          {value.map((pkg) => (
            <span key={pkg} className="dependency-chip">
              {pkg}
              <button
                type="button"
                className="chip-remove-btn"
                onClick={() => removePackage(pkg)}
                aria-label={`Remove ${pkg}`}
              >
                x
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && query.trim()) {
              event.preventDefault()
              addPackage(query)
            }
          }}
        />

        {isOpen ? (
          <div className="search-dropdown">
            {!query.trim() ? (
              <p className="dropdown-state">Please enter the dependency to load.</p>
            ) : null}
            {isLoading ? <p className="dropdown-state">Loading...</p> : null}
            {!isLoading && error ? (
              <p className="dropdown-state">{error}</p>
            ) : null}
            {!isLoading && !error && query.trim() && results.length === 0 ? (
              <p className="dropdown-state">No packages found.</p>
            ) : null}

            {!isLoading && !error
              ? results.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    className="dropdown-item"
                    onClick={() => addPackage(item.name)}
                  >
                    <span className="item-name">{item.name}</span>
                    <span className="item-meta">
                      {item.version}
                      {item.description ? ` - ${item.description}` : ''}
                    </span>
                  </button>
                ))
              : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default DependencySearchSelect

