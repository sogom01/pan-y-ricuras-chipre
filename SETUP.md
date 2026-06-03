# Pan y Ricuras Chipre — Setup Guide

## 1. Comando de inicialización del proyecto

Ejecutar en la carpeta `pan-y-ricuras-chipre` (ya existe en el Desktop):

```bash
# Inicializar Next.js 15 con TypeScript, Tailwind, ESLint, App Router
# El flag --use-npm fuerza npm (puedes omitirlo si usas pnpm/yarn)
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

> **Por qué `--no-git`?** La carpeta ya existe sin git. Iniciamos git manualmente
> justo después para poder agregar el .gitignore primero.

```bash
# Después de create-next-app:

# 1. Crear .env.local ANTES de git init (para que el .gitignore lo cubra)
copy NUL .env.local

# 2. Inicializar git
git init
git add .
git commit -m "chore: initialize Next.js 15 project"
```

### Dependencias adicionales

```bash
# Supabase JS (cliente oficial — incluye browser + SSR helpers)
npm install @supabase/supabase-js @supabase/ssr

# Zod (validación y tipado de formularios — barrera anti-XSS)
npm install zod

# Testing: Vitest + RTL
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Supabase CLI (para migrations locales — opcional en MVP, útil para emular DB)
npm install -D supabase
```

### tsconfig.json — asegurar modo estricto

Verificar que `tsconfig.json` incluya (create-next-app lo pone por defecto, confirmar):

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Tailwind — registrar paleta del diseño

En `tailwind.config.ts`, agregar bajo `theme.extend.colors`:

```ts
colors: {
  bg:        '#1a0f07',
  surface:   '#231508',
  surface2:  '#2e1c0a',
  surface3:  '#3a230d',
  gold:      '#c99e4c',
  goldLight: '#e8c97a',
  cream:     '#f5ead8',
  green:     '#4a7c59',
  red:       '#c0392b',
},
fontFamily: {
  serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
  sans:  ['Syne', 'system-ui', 'sans-serif'],
},
```

### Variables de entorno (.env.local)

```env
# Obtener desde: Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NUNCA exponer con prefijo NEXT_PUBLIC_ — solo para server-side
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Aplicar migraciones en Supabase

### Opción A — SQL Editor (recomendada para MVP)

1. Ir a Supabase Dashboard > SQL Editor
2. Ejecutar los archivos en orden estricto:
   - `supabase/migrations/001_menu_items_table.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_menu.sql`
3. Verificar con la query del comentario final de `003_seed_menu.sql`

### Opción B — Supabase CLI (si instalaste la CLI)

```bash
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

## 3. Configurar Supabase Auth

En Supabase Dashboard > Authentication > Settings:

- **Email confirmations:** OFF (admin único, cuentas creadas manualmente)
- **Minimum password length:** 12
- **Enable email provider:** ON

Crear el primer usuario admin:

```bash
# En Supabase Dashboard > Authentication > Users > Add user
# Email: admin@panyricuras.co (o el real)
# Password: usa un gestor de contraseñas — mínimo 16 chars, aleatorio
# NUNCA volver a usar "admin123"
```

## 4. Estructura de carpetas que se construirá en Fase 3

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    ← Carta pública (Server Component)
│   └── admin/
│       ├── login/page.tsx
│       └── menu/page.tsx
├── components/
│   ├── MenuCard.tsx
│   ├── ItemModal.tsx
│   └── EditModal.tsx
└── lib/
    ├── supabase/
    │   ├── client.ts               ← Fase 3
    │   └── server.ts               ← Fase 3
    ├── repositories/
    │   └── menu-repository.ts      ← Fase 3
    ├── domain/
    │   ├── menu-item.ts            ← Fase 3
    │   └── menu-service.ts         ← Fase 3
    └── validation/
        └── menu-schema.ts          ← Fase 3
```
