import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso Administrador",
  // Evitar que Google indexe el panel de login
  robots: { index: false, follow: false },
};

// ── Server Action: login ──────────────────────────────────────────────────────
// Por qué Server Action y no API Route:
//   • La Action corre en el servidor — las credenciales nunca pasan por JS del cliente.
//   • Next.js genera automáticamente un token CSRF para cada Server Action.
//     No necesitamos implementar protección CSRF manualmente (OWASP A01).
//   • El formulario funciona incluso sin JS (progressive enhancement).
//
// OWASP A07 — Autenticación:
//   • El mensaje de error es SIEMPRE genérico: "Credenciales incorrectas".
//     Nunca distinguir "email no registrado" vs "contraseña incorrecta" —
//     eso permite a un atacante enumerar usuarios válidos.
//   • Supabase Auth tiene throttling propio (~5 intentos antes de bloquear).
//     TODO(post-mvp): agregar rate limiting explícito con @upstash/ratelimit
//     para no depender solo del throttling de Supabase.

async function loginAction(formData: FormData) {
  "use server";

  const email    = String(formData.get("email")    ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  // Validación mínima antes de llamar a Supabase (evita requests innecesarios)
  if (!email || !password) {
    redirect("/admin/login?error=1");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // No loguear el error completo — puede contener info sensible.
    // Solo categoría para diagnóstico interno.
    // TODO(post-mvp): Sentry.captureException con datos sanitizados.
    console.error("[login] auth error code:", error.status);
    redirect("/admin/login?error=1");
  }

  redirect("/admin/menu");
}

// ── Logout Action ─────────────────────────────────────────────────────────────
async function logoutAction() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const hasError = error === "1";

  return (
    <div className="min-h-screen bg-[#1a0f07] flex items-center justify-center p-4">
      {/* Fondo punteado decorativo */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(201,158,76,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div
          className="rounded-[22px] p-8 text-center animate-slide-up"
          style={{
            background: "linear-gradient(155deg, #2e1c0a, #231508)",
            border: "1px solid rgba(201,158,76,0.4)",
          }}
        >
          {/* Línea dorada superior */}
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #c99e4c, transparent)" }}
          />

          <div className="text-5xl mb-5">🔑</div>

          <h1 className="font-serif text-2xl font-bold text-[#f5ead8] mb-1">
            Acceso administrador
          </h1>
          <p className="text-xs text-[rgba(245,234,216,0.35)] font-sans mb-6">
            Solo para el equipo de Pan y Ricuras
          </p>

          {/* Mensaje de error — genérico (OWASP A07) */}
          {hasError && (
            <div
              className="mb-4 px-4 py-2 rounded-xl text-sm font-sans font-semibold"
              style={{
                background: "rgba(192,57,43,0.12)",
                border: "1px solid rgba(192,57,43,0.3)",
                color: "#c0392b",
              }}
            >
              Credenciales incorrectas. Intenta de nuevo.
            </div>
          )}

          <form action={loginAction} className="flex flex-col gap-3">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-center font-sans"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,158,76,0.18)",
                color: "#f5ead8",
                outline: "none",
              }}
            />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm text-center font-sans"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,158,76,0.18)",
                color: "#f5ead8",
                outline: "none",
              }}
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-sans font-extrabold cursor-pointer mt-1"
              style={{
                background: "linear-gradient(135deg, #c99e4c, #8b6110)",
                border: "none",
                color: "#1a0f07",
              }}
            >
              Entrar
            </button>
          </form>

          {/* Botón logout para sesión activa llegando a login — invisible para visitantes,
              el middleware ya redirige a /admin/menu si hay sesión, pero por si acaso */}
          <form action={logoutAction} className="mt-3">
            {/* Sin botón visible — el middleware maneja la redirección.
                TODO(post-mvp): UI de "cerrar sesión" explícita en el panel admin */}
          </form>
        </div>
      </div>
    </div>
  );
}
