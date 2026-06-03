import { z } from "zod";

// ── Categorías válidas ────────────────────────────────────────────────────────
// Lista cerrada que espeja el CHECK constraint de Postgres en 001_menu_items_table.sql.
// Si añades una categoría en SQL, agrégala aquí también — el compilador TS
// entonces te advertirá en todos los lugares del código que dependan de este tipo.
export const MENU_CATEGORIES = [
  "🥐 Panadería",
  "🍰 Repostería",
  "☕ Bebidas Calientes",
  "🧋 Bebidas Frías",
  "🍳 Desayunos",
  "🥪 Almuerzos",
] as const;

export type MenuCategory = (typeof MENU_CATEGORIES)[number];

// ── Schema Zod (fuente única de verdad para validación) ───────────────────────
// Este schema cumple tres roles al mismo tiempo:
//   1. Valida datos que llegan de Supabase (por si la DB devuelve algo inesperado)
//   2. Valida datos del formulario admin antes de enviarlos a la DB
//   3. Genera los tipos TypeScript con z.infer — no duplicamos definiciones.
//
// Seguridad OWASP A03/A04: toda entrada externa pasa por parse() antes de
// llegar a la capa de repositorio. Si el dato no cumple el schema, lanza
// ZodError con mensaje descriptivo — nunca llega SQL ni lógica de negocio.

const MenuItemSchema = z.object({
  id:          z.string().uuid(),
  nombre:      z.string().min(1, "El nombre es obligatorio").max(120),
  descripcion: z.string().min(1, "La descripción es obligatoria").max(400),
  // precio > 0 espeja el CHECK constraint de Postgres
  precio:      z.number().int("El precio debe ser un entero").positive("El precio debe ser mayor a 0"),
  emoji:       z.string().min(1).max(10).default("🍽️"),
  cat:         z.enum(MENU_CATEGORIES, {
    errorMap: () => ({ message: `Categoría inválida. Opciones: ${MENU_CATEGORIES.join(", ")}` }),
  }),
  destacado:   z.boolean().default(false),
  disponible:  z.boolean().default(true),
  created_at:  z.string().datetime({ offset: true }),
  updated_at:  z.string().datetime({ offset: true }),
});

// ── Tipos inferidos (TypeScript los genera del schema, no al revés) ───────────

/** Producto completo tal como existe en la DB. */
export type MenuItem = z.infer<typeof MenuItemSchema>;

/** Campos requeridos para crear un producto nuevo. */
export type CreateMenuItemInput = z.infer<typeof CreateMenuItemSchema>;

/** Campos para actualizar — todos opcionales excepto el id. */
export type UpdateMenuItemInput = z.infer<typeof UpdateMenuItemSchema>;

// ── Schemas derivados para operaciones CRUD ───────────────────────────────────

// Para CREATE: omitimos los campos que genera la DB automáticamente.
const CreateMenuItemSchema = MenuItemSchema.omit({
  id:         true,
  created_at: true,
  updated_at: true,
});

// Para UPDATE: id obligatorio + cualquier combinación de los demás campos.
const UpdateMenuItemSchema = MenuItemSchema
  .omit({ created_at: true, updated_at: true })
  .partial()
  .required({ id: true });

// ── Funciones de validación públicas ─────────────────────────────────────────

/**
 * Valida y parsea un valor desconocido como MenuItem completo.
 * Usar al leer filas de Supabase para garantizar el contrato de tipos.
 * Lanza ZodError si el dato no cumple el schema.
 */
export function parseMenuItem(raw: unknown): MenuItem {
  return MenuItemSchema.parse(raw);
}

/**
 * Valida el input de creación de un producto.
 * Usar en el repositorio antes de cualquier INSERT.
 */
export function parseCreateInput(raw: unknown): CreateMenuItemInput {
  return CreateMenuItemSchema.parse(raw);
}

/**
 * Valida el input de actualización de un producto.
 * Usar en el repositorio antes de cualquier UPDATE.
 */
export function parseUpdateInput(raw: unknown): UpdateMenuItemInput {
  return UpdateMenuItemSchema.parse(raw);
}

// ── Invariante de negocio ─────────────────────────────────────────────────────

/**
 * Un item marcado como "destacado" no tiene sentido si está agotado.
 * Esta función verifica la regla y devuelve el item corregido.
 * Se aplica antes de todo INSERT/UPDATE en el repositorio.
 */
export function enforceDestacadoInvariant<T extends { destacado: boolean; disponible: boolean }>(
  item: T
): T {
  if (item.destacado && !item.disponible) {
    return { ...item, destacado: false };
  }
  return item;
}
