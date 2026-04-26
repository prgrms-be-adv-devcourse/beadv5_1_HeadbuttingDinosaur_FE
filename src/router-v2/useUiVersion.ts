import { useEffect } from 'react'

export type UiVersion = '1' | '2'

const STORAGE_KEY = 'ui.version'

function normalize(value: string | null | undefined): UiVersion | null {
  return value === '1' || value === '2' ? value : null
}

function readUrlVersion(): UiVersion | null {
  return normalize(new URLSearchParams(window.location.search).get('v'))
}

function readStorageVersion(): UiVersion | null {
  return normalize(localStorage.getItem(STORAGE_KEY))
}

function readEnvVersion(): UiVersion | null {
  return normalize(import.meta.env.VITE_UI_DEFAULT_VERSION)
}

export function useUiVersion(): UiVersion {
  const urlVersion = readUrlVersion()

  useEffect(() => {
    if (urlVersion === '2') localStorage.setItem(STORAGE_KEY, '2')
    else if (urlVersion === '1') localStorage.removeItem(STORAGE_KEY)
  }, [urlVersion])

  return urlVersion ?? readStorageVersion() ?? readEnvVersion() ?? '1'
}
