import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Say My Name] Supabase no está configurado. Copiá .env.example a .env y completá VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
  )
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'anon', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: { eventsPerSecond: 20 },
  },
})

let signInPromise: Promise<string> | null = null

export async function ensureAnonymousUser(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  if (data.session?.user) return data.session.user.id

  if (!signInPromise) {
    signInPromise = supabase.auth.signInAnonymously().then(({ data: signInData, error }) => {
      if (error || !signInData.user) {
        signInPromise = null
        throw error ?? new Error('No se pudo iniciar sesión anónima')
      }
      return signInData.user.id
    })
  }
  return signInPromise
}
