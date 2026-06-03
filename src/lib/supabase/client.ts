import { createBrowserClient } from "@supabase/ssr";

// ── Cliente browser (componentes Client en Next.js App Router) ────────────────
//
// POR QUÉ un archivo separado para el browser:
//   • En Next.js App Router, los componentes Client ("use client") se ejecutan
//     en el NAVEGADOR del usuario. No tienen acceso a cookies HttpOnly del
//     servidor ni al contexto de Request/Response de Next.js.
//   • createBrowserClient usa localStorage/sessionStorage para mantener la
//     sesión en el lado cliente. Supabase SSR lo gestiona automáticamente.
//   • Este cliente SOLO debe usarse en componentes marcados con "use client".
//     Para Server Components y Route Handlers, usar src/lib/supabase/server.ts.
//
// SEGURIDAD:
//   • Solo expone NEXT_PUBLIC_* — valores visibles en el bundle del cliente.
//   • La anon key es pública por diseño: RLS en la DB es la barrera real.
//   • SUPABASE_SERVICE_ROLE_KEY NUNCA va aquí — esa key bypasea RLS.

export function createClient() {
  return createBrowserClient(
    // Variables obligatorias — si faltan, el error aparece en build time (TS strict)
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
