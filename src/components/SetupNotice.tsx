export function SetupNotice({ error }: { error?: string }) {
  return (
    <div className="app-shell items-center justify-center text-center">
      <div className="panel">
        <p className="text-5xl">🛠️</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-cyan">Falta configurar Supabase</h1>
        {error && <p className="mt-2 text-magenta">{error}</p>}
        <div className="mt-4 space-y-2 text-left text-sm text-white/70">
          <p>1. Creá un proyecto en Supabase y activá el login anónimo.</p>
          <p>2. Aplicá <code className="text-cyan">supabase/migrations/0001_init.sql</code>.</p>
          <p>3. Copiá <code className="text-cyan">.env.example</code> a <code className="text-cyan">.env</code> y completá:</p>
          <pre className="overflow-x-auto rounded-xl bg-black/40 p-3 text-xs text-white/80">
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...</pre>
          <p>4. Reiniciá <code className="text-cyan">npm run dev</code>.</p>
        </div>
      </div>
    </div>
  )
}
