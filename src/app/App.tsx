import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ensureAnonymousUser, isSupabaseConfigured } from '@/services/supabaseClient'
import { useSessionStore } from '@/store/sessionStore'
import { ErrorBoundary } from './ErrorBoundary'
import { Loader } from '@/components/Loader'
import { SetupNotice } from '@/components/SetupNotice'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const RoomPage = lazy(() => import('@/pages/RoomPage').then((m) => ({ default: m.RoomPage })))

export function App() {
  const setUserId = useSessionStore((s) => s.setUserId)
  const [ready, setReady] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true)
      return
    }
    ensureAnonymousUser()
      .then((id) => setUserId(id))
      .catch((e) => setAuthError(e?.message ?? 'Error de autenticación'))
      .finally(() => setReady(true))
  }, [setUserId])

  if (!isSupabaseConfigured) return <SetupNotice />
  if (!ready) return <Loader label="Conectando…" />
  if (authError) return <SetupNotice error={authError} />

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/room/:code" element={<RoomPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
