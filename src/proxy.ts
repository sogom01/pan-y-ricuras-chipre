import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Middleware de sesión y protección de rutas ────────────────────────────────
// El middleware corre en el Edge Runtime de Vercel — ANTES de que la petición
// llegue a cualquier Server Component o Route Handler. Tiene dos roles:
//
//   1. REFRESCO DE TOKEN: Supabase Access Tokens duran 1 hora. El middleware
//      renueva el token silenciosamente en cada request (usando el Refresh Token
//      almacenado en la cookie HttpOnly). Sin esto, el admin vería su sesión
//      expirar a mitad de la jornada.
//
//   2. PROTECCIÓN DE RUTAS: /admin/* (excepto /admin/login) require sesión activa.
//      Si no hay sesión → redirect a /admin/login. Esto es la segunda capa de
//      defensa (la primera es RLS en la DB — defense in depth).
//
// ⚠️  CRÍTICO — Por qué getUser() y NO getSession():
//      getSession() solo lee la cookie local sin verificar con el servidor de Auth.
//      Un token manipulado o revocado pasaría la guardia. getUser() siempre
//      hace una llamada a Supabase Auth para validar el JWT — más lento (~50ms)
//      pero correcto. OWASP A07.

export async function proxy(request: NextRequest) {
  // Si las credenciales no están configuradas (modo demo / primera ejecución),
  // dejar pasar todas las peticiones sin verificar sesión.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  // Patrón oficial Supabase SSR: la respuesta se construye antes de crear el cliente
  // para poder mutar sus cookies (refresco de token).
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Primero actualizar en el objeto request (para que el resto
          // del middleware lo vea)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Luego crear la respuesta con las cookies actualizadas para el browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verificar sesión con el servidor de Auth (no solo desde la cookie local)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── Proteger /admin/* (excepto /admin/login) ──────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage  = pathname.startsWith("/admin/login");

  if (isAdminRoute && !isLoginPage && !user) {
    // Sin sesión en ruta protegida → login
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user) {
    // Ya logueado intentando ir al login → panel
    const menuUrl = request.nextUrl.clone();
    menuUrl.pathname = "/admin/menu";
    return NextResponse.redirect(menuUrl);
  }

  // IMPORTANTE: devolver siempre supabaseResponse (no NextResponse.next() fresco)
  // para que las cookies del refresco de token lleguen al browser.
  return supabaseResponse;
}

// ── Matcher ───────────────────────────────────────────────────────────────────
// Excluir archivos estáticos para no correr el middleware en cada imagen/CSS —
// el refresco de token en assets estáticos es overhead puro.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
