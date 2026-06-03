import type { SupabaseClient } from "@supabase/supabase-js";
import {
  type MenuItem,
  type CreateMenuItemInput,
  type UpdateMenuItemInput,
  parseMenuItem,
  parseCreateInput,
  parseUpdateInput,
  enforceDestacadoInvariant,
  MENU_CATEGORIES,
} from "@/lib/domain/menu-item";

// ── Errores de dominio ────────────────────────────────────────────────────────
// No exponemos errores raw de Supabase/Postgres al exterior.
// Razones:
//   1. SEGURIDAD: los mensajes de error de Postgres pueden revelar estructura
//      interna (nombre de columnas, constraints, tipos). OWASP A09.
//   2. CONTRATO: la UI y los tests dependen de errores predecibles,
//      no de strings de Postgres que pueden cambiar entre versiones.

export class MenuRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: "NOT_FOUND" | "VALIDATION" | "DATABASE" | "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "MenuRepositoryError";
  }
}

// ── Repository Pattern ────────────────────────────────────────────────────────
// MenuRepository es la ÚNICA puerta entre la lógica de negocio y Supabase.
// Beneficios:
//   • Para cambiar de Supabase a otra DB: solo se toca este archivo.
//   • Para testear la lógica: se mockea este repositorio (no Supabase directamente).
//   • Centraliza el manejo de errores y la validación de salida.
//
// El constructor recibe el cliente inyectado (browser o server).
// Esto es Dependency Injection: el repositorio no sabe si está en el
// servidor o en el browser — el llamador decide. Facilita el testing.

export class MenuRepository {
  private readonly TABLE = "menu_items" as const;

  constructor(private readonly client: SupabaseClient) {}

  // ── Lectura pública (rol anon, RLS filtra disponibles automáticamente) ──────
  async getPublicMenu(): Promise<MenuItem[]> {
    const { data, error } = await this.client
      .from(this.TABLE)
      .select("*")
      .order("cat")
      .order("nombre");

    if (error) throw this.mapError(error);

    // Validar que la DB devuelva la forma esperada (contrato de tipos)
    return (data ?? []).map(parseMenuItem);
  }

  // ── Lectura completa (rol authenticated, ve items agotados también) ─────────
  async getAllMenu(): Promise<MenuItem[]> {
    const { data, error } = await this.client
      .from(this.TABLE)
      .select("*")
      .order("cat")
      .order("nombre");

    if (error) throw this.mapError(error);

    return (data ?? []).map(parseMenuItem);
  }

  // ── Crear producto ───────────────────────────────────────────────────────────
  async createItem(raw: unknown): Promise<MenuItem> {
    // 1. Validar input (lanza ZodError si inválido — convertido abajo)
    const input = this.wrapValidation(() => parseCreateInput(raw));

    // 2. Aplicar invariante de negocio antes de persistir
    const sanitized = enforceDestacadoInvariant(input);

    const { data, error } = await this.client
      .from(this.TABLE)
      .insert(sanitized)
      .select()
      .single();

    if (error) throw this.mapError(error);
    if (!data) throw new MenuRepositoryError("No se pudo crear el producto", "DATABASE");

    return parseMenuItem(data);
  }

  // ── Actualizar producto ──────────────────────────────────────────────────────
  async updateItem(raw: unknown): Promise<MenuItem> {
    const input = this.wrapValidation(() => parseUpdateInput(raw));
    const { id, ...fields } = input;

    if (Object.keys(fields).length === 0) {
      throw new MenuRepositoryError("Debes enviar al menos un campo para actualizar", "VALIDATION");
    }

    const sanitized = enforceDestacadoInvariant({ destacado: false, disponible: true, ...fields });

    const { data, error } = await this.client
      .from(this.TABLE)
      .update(sanitized)
      .eq("id", id)
      .select()
      .single();

    if (error) throw this.mapError(error);
    if (!data) throw new MenuRepositoryError(`Producto ${id} no encontrado`, "NOT_FOUND");

    return parseMenuItem(data);
  }

  // ── Eliminar producto ────────────────────────────────────────────────────────
  async deleteItem(id: string): Promise<void> {
    if (!id) throw new MenuRepositoryError("ID requerido para eliminar", "VALIDATION");

    const { error } = await this.client
      .from(this.TABLE)
      .delete()
      .eq("id", id);

    if (error) throw this.mapError(error);
  }

  // ── Helpers privados ─────────────────────────────────────────────────────────

  private wrapValidation<T>(fn: () => T): T {
    try {
      return fn();
    } catch (err) {
      // Convertir ZodError en MenuRepositoryError con mensaje legible
      const msg = err instanceof Error ? err.message : "Datos inválidos";
      throw new MenuRepositoryError(msg, "VALIDATION");
    }
  }

  private mapError(error: { code?: string; message: string }): MenuRepositoryError {
    // Postgres error codes comunes — no exponemos el mensaje original
    switch (error.code) {
      case "42501": // insufficient_privilege (RLS violation)
        return new MenuRepositoryError("No tienes permiso para realizar esta acción", "UNAUTHORIZED");
      case "23505": // unique_violation
        return new MenuRepositoryError("Ya existe un producto con ese nombre en esa categoría", "VALIDATION");
      case "23514": // check_violation (precio ≤ 0, cat inválida, etc.)
        return new MenuRepositoryError("Los datos no cumplen las restricciones del menú", "VALIDATION");
      case "PGRST116": // PostgREST: no rows returned on .single()
        return new MenuRepositoryError("Producto no encontrado", "NOT_FOUND");
      default:
        // Log interno (sin exponer al cliente) — TODO(post-mvp): Sentry.captureException
        console.error("[MenuRepository] DB error:", error.code, error.message);
        return new MenuRepositoryError("Error interno al acceder al menú", "DATABASE");
    }
  }
}

// ── Listado de categorías para formularios UI ─────────────────────────────────
// Re-exportamos desde aquí para que la UI importe de un solo lugar
export { MENU_CATEGORIES };
