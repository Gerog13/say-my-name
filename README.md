# Say My Name

PWA multiplayer en tiempo real inspirada en el juego de mesa argentino **Say My Name**. Pensada para jugar entre amigos desde el celular, de forma presencial y sincronizada.

Stack: **React + Vite + TypeScript + TailwindCSS + Zustand + React Router + Framer Motion** en el front y **Supabase** (Postgres + Realtime + Auth anónimo) como backend serverless.

## Requisitos

- Node 18+
- Una cuenta de [Supabase](https://supabase.com) (plan free alcanza)

## 1. Crear el proyecto Supabase

1. Entrá a https://supabase.com/dashboard y creá un nuevo proyecto.
2. Anotá el **Project URL** y la **anon public key** (Project Settings → API).
3. Activá **Anonymous sign-ins**: Authentication → Providers → *Anonymous* → Enable.

## 2. Aplicar la base de datos

Opción A (rápida): copiá el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y pegalo en el **SQL Editor** del dashboard, luego Run.

Opción B (CLI):

```bash
npm i -g supabase
supabase link --project-ref <tu-project-ref>
supabase db push
```

Esto crea las tablas `sessions`, `teams`, `players`, las políticas RLS y habilita Realtime.

## 3. Variables de entorno

```bash
cp .env.example .env
```

Completá:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

## 4. Correr en desarrollo

```bash
npm install
npm run dev
```

Abrí la URL en el celular (misma red / o deploy) y creá una sala.

## 5. Build / Deploy

```bash
npm run build
npm run preview
```

Deployá `dist/` en cualquier hosting estático (Vercel, Netlify, Cloudflare Pages). Al servirse por HTTPS, la app es instalable como PWA en Android e iPhone.

## Cómo se juega

1. El host crea una sala y comparte el **código** o el **QR**.
2. Todos se unen desde su celular, eligen nombre/avatar y equipo.
3. Se elige una **categoría global** (Títulos / Personajes / Vale Todo) y la config.
4. Se juegan las rondas: describir → una palabra → relámpago → mímica.
5. Puntajes en tiempo real y podio final con estadísticas.

## Arquitectura

- **Postgres es la fuente de verdad.** El estado vive en `sessions` / `teams` / `players`.
- **Supabase Realtime (Postgres Changes)** propaga cambios a todos los clientes.
- El **host es autoritativo**: es el único que escribe transiciones de ronda/turno/timer. El resto envía intents mínimos.
- El **timer** se sincroniza con `turn_ends_at` (timestamp del server) + offset de reloj medido al conectar.
