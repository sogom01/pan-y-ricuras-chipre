"use server";

// ── Server Actions para el panel de administración ────────────────────────────
// Archivo separado con "use server" al tope para que los Client Components
// puedan importar y llamar estas acciones directamente (sin forms).
// Next.js serializa los argumentos y respuestas automáticamente.
// CSRF está garantizado por Next.js en toda Server Action.

import { redirect }      from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient }  from "@/lib/supabase/server";
import { MenuRepository } from "@/lib/repositories/menu-repository";
import type { CreateMenuItemInput, UpdateMenuItemInput } from "@/lib/domain/menu-item";

// Guard reutilizable — verifica sesión real (no solo cookie local)
async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

export async function createItemAction(input: CreateMenuItemInput): Promise<void> {
  const supabase = await requireAuth();
  const repo = new MenuRepository(supabase);
  await repo.createItem(input);
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function updateItemAction(input: UpdateMenuItemInput): Promise<void> {
  const supabase = await requireAuth();
  const repo = new MenuRepository(supabase);
  await repo.updateItem(input);
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function toggleDisponibleAction(id: string, disponibleActual: boolean): Promise<void> {
  const supabase = await requireAuth();
  const repo = new MenuRepository(supabase);
  await repo.updateItem({ id, disponible: !disponibleActual });
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function deleteItemAction(id: string): Promise<void> {
  const supabase = await requireAuth();
  const repo = new MenuRepository(supabase);
  await repo.deleteItem(id);
  revalidatePath("/");
  revalidatePath("/admin/menu");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
