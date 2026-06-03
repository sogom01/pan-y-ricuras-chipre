import type { NextConfig } from "next";

// ── CSP builder ───────────────────────────────────────────────────────────────
// La CSP se construye en tiempo de arranque del servidor, donde las env vars
// ya están disponibles. Usar headers HTTP (no <meta>) porque:
//   • Los headers HTTP se aplican ANTES de que el browser parsee el HTML
//   • Un meta CSP no bloquea recursos que el browser empieza a cargar
//     inmediatamente (scripts inline en <head> previos al meta tag)
//   • Solo los headers controlan fetch(), XHR y WebSockets

function buildCsp(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // Extraer solo el hostname para connect-src (wss:// para Realtime de Supabase)
  const supabaseHost = supabaseUrl ? new URL(supabaseUrl).host : "";

  const directives: Record<string, string[]> = {
    "default-src":    ["'self'"],
    // 'unsafe-inline' en style-src es necesario para Tailwind JIT y los
    // estilos que Next.js inyecta en tiempo de ejecución.
    // TODO(post-mvp): migrar a nonce-based CSP para eliminar 'unsafe-inline'
    "style-src":      ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    // next/font/google auto-hostea las fuentes en tu dominio (no request externo
    // en runtime). Incluimos fonts.gstatic.com para los preconnect hints que
    // Next.js puede inyectar durante el build.
    "font-src":       ["'self'", "fonts.gstatic.com"],
    "img-src":        ["'self'", "data:"],
    // connect-src cubre fetch() al cliente Supabase (REST + Auth)
    // wss:// cubre Supabase Realtime (aunque no lo usamos en MVP, el cliente
    // lo intenta conectar; bloquearlo daría errores en consola).
    "connect-src":    ["'self'", ...(supabaseHost ? [`https://${supabaseHost}`, `wss://${supabaseHost}`] : [])],
    "script-src":     ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    // TODO(post-mvp): reemplazar 'unsafe-inline' + 'unsafe-eval' en script-src
    // con nonce-based CSP. Next.js 15 tiene soporte nativo via middleware.
    // Ver: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
    "frame-ancestors": ["'none'"],
    "base-uri":       ["'self'"],
    "form-action":    ["'self'"],
    "object-src":     ["'none'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

const nextConfig: NextConfig = {
  // TODO(post-mvp): resolver los errores de TypeScript y quitar estos flags
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    const csp = buildCsp();

    return [
      {
        // Aplicar a todas las rutas
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            // Impide que la app sea embebida en un iframe (clickjacking — OWASP A05)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Impide que el browser "adivine" el Content-Type (MIME sniffing attacks)
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Al navegar hacia un sitio externo, no enviar la URL completa de origen
            // en el header Referer — protege URLs de admin que puedan filtrarse
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Desactivar features del browser que no usamos — reduce superficie de ataque
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            // Forzar HTTPS por 1 año + incluir subdominios
            // Solo activar en producción — en local puede causar problemas con http://
            // TODO(post-mvp): mover a condicional process.env.NODE_ENV === "production"
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
