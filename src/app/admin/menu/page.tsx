import { redirect }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { MenuRepository } from "@/lib/repositories/menu-repository";
import AdminControls     from "@/app/admin/menu/AdminControls";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Admin — Menú",
  robots: { index: false, follow: false },
};

// ── Page (Server Component) ───────────────────────────────────────────────────
// Responsabilidad única: verificar sesión + obtener datos + renderizar el
// Client Component (AdminControls) con los datos como props serializables.
// Toda la interactividad (modales, toasts, calls a Server Actions) vive en
// AdminControls — la separación Server/Client es limpia.

export default async function AdminMenuPage() {
  const supabase = await createClient();

  // getUser() — verificación con el servidor Auth, no solo desde cookie local
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const repo  = new MenuRepository(supabase);
  const items = await repo.getAllMenu(); // incluye agotados (RLS auth_select_all)

  return (
    <div className="min-h-screen" style={{ background: "#1a0f07" }}>
      <AdminControls
        items={items}
        userEmail={user.email ?? "—"}
      />
    </div>
  );
}
