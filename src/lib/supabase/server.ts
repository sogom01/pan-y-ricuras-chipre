import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Cliente servidor (Server Components y Route Handlers) ─────────────────────
//
// POR QUÉ un archivo separado para el servidor:
//   • En Server Components, los datos se fetchen en el servidor de Vercel,
//     no en el navegador del cliente. La sesión del admin viaja en cookies
//     HttpOnly — el navegador no puede leerlas con JS (protección XSS).
//   • createServerClient necesita acceso al cookie-store de Next.js para
//     leer el token de sesión y para rotar el token cuando expira
//     (set/remove cookies). El browser client no puede hacer esto.
//   • USAR ESTE ARCHIVO en: page.tsx (server), layout.tsx (server),
//     app/api/*/route.ts. Nunca en componentes con "use client".
//
// SEGURIDAD:
//   • La cookie de sesión la configura Supabase SSR con:
//       HttpOnly: true   → JS no puede leer el token (anti-XSS)
//       Secure: true     → solo HTTPS en producción
//       SameSite: Lax    → protección básica anti-CSRF
//   • El usuario autenticado hereda su rol "authenticated" de Supabase Auth,
//     que las RLS policies en la DB verifican en cada query.

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll puede fallar en Server Components de solo lectura.
            // En ese caso, el middleware de refresco de tokens se encarga.
            // No lanzar error — es comportamiento esperado de Next.js.
          }
        },
      },
    }
  );
}
