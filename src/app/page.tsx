import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { MenuRepository } from "@/lib/repositories/menu-repository";
import { DEMO_ITEMS } from "@/lib/demo-data";
import MenuContent from "@/components/MenuContent";

// ── SEO ───────────────────────────────────────────────────────────────────────
// La metadata se genera en servidor — Google la indexa sin necesidad de JS.
// Términos clave: "panadería chipre manizales", "pan artesanal manizales",
// "repostería chipre" — búsquedas de intención local alta.
export const metadata: Metadata = {
  title: "Carta | Pan y Ricuras Chipre — Panadería Artesanal en Manizales",
  description:
    "Conoce nuestra carta: panes artesanales, repostería fina, desayunos campesinos y bebidas. Visítanos en Chipre, Carrera 23 #71-45, Manizales.",
  openGraph: {
    title: "Pan y Ricuras Chipre — Panadería & Repostería",
    description:
      "Pan artesanal, croissants, cheesecakes, desayunos y café de origen colombiano. Barrio Chipre, Manizales.",
    locale: "es_CO",
    type: "website",
    siteName: "Pan y Ricuras Chipre",
  },
  // Datos estructurados para Google (LocalBusiness) van en el componente
  // como <script type="application/ld+json"> — lo agregamos en Fase 5 UI.
  // TODO(post-mvp): agregar JSON-LD LocalBusiness schema para rich results.
};

// ── Revalidación ──────────────────────────────────────────────────────────────
// La carta pública se cachea en el CDN de Vercel y se revalida cada 5 minutos.
// Cuando el admin cambia un precio o disponibilidad, `revalidatePath("/")` en
// la Server Action actualiza el cache — no hace falta esperar 5 min.
// Con <500 visitas/día el cache hit rate será ~99% → DB casi no recibe carga.
export const revalidate = 300; // segundos

// ── Page (Server Component) ───────────────────────────────────────────────────
// Este componente corre SOLO en el servidor:
//   • El bundle de JavaScript del cliente NO incluye código de DB ni credenciales.
//   • El HTML inicial llega con los datos ya inyectados → SEO perfecto.
//   • Los componentes Client (MenuContent) reciben los items como props
//     serializables (plain objects, no instancias de clase).

export default async function CartaPage() {
  // Modo demo: si Supabase no está configurado, usar los datos del prototipo.
  // Cuando llenes .env.local con las credenciales reales, esta rama nunca se toma.
  const isConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let items = DEMO_ITEMS;
  if (isConfigured) {
    const supabase = await createClient();
    const repo     = new MenuRepository(supabase);
    items = await repo.getPublicMenu();
  }

  return <MenuContent initialItems={items} />;
}
