import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles-v2/index.css'
import './styles/globals.css'

// Dev-only v2 Layout preview entry. The DEV guard lets Vite/Rollup
// tree-shake the lazy chunk out of production builds; the path guard keeps
// the rest of the app untouched per layout.plan §7-3 (no App.tsx edits).
// Removed in the first v2 page PR.
const LayoutPreview = lazy(() => import('./components-v2/Layout/__preview'))
const useLayoutPreview =
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  window.location.pathname === '/__layout-preview'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              {useLayoutPreview ? (
                <Suspense fallback={null}>
                  <LayoutPreview />
                </Suspense>
              ) : (
                <App />
              )}
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
)
