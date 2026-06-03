import { describe, it, expect, vi, beforeEach, type MockInstance } from "vitest";
import { MenuRepository, MenuRepositoryError } from "@/lib/repositories/menu-repository";
import type { MenuItem } from "@/lib/domain/menu-item";

// ── Estrategia de mock ────────────────────────────────────────────────────────
// Mockeamos el cliente Supabase completo con vi.fn().
// No mockeamos el módulo @supabase/supabase-js (eso sería frágil ante upgrades).
// En su lugar, creamos un objeto que imita la interfaz fluent de Supabase:
//   client.from("menu_items").select("*").order("cat").order("nombre")
// Cada método encadenado devuelve "this" (el mismo objeto mock) excepto
// los terminales (.single(), los que resuelven la Promise).
//
// POR QUÉ NO USAR LA DB REAL EN UNIT TESTS:
//   • Los unit tests deben ser deterministas, rápidos y sin dependencias externas.
//   • Una DB real introduce latencia de red, estado compartido y credenciales.
//   • Los tests de integración contra DB real vienen en fase post-MVP con Vitest
//     y un proyecto Supabase de staging. TODO(post-mvp): integration tests.

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id:          "123e4567-e89b-12d3-a456-426614174000",
  nombre:      "Pan de Achira",
  descripcion: "Pan tradicional de almidón de achira, crujiente por fuera y suave por dentro.",
  precio:      3500,
  emoji:       "🥐",
  cat:         "🥐 Panadería",
  destacado:   true,
  disponible:  true,
  created_at:  "2024-01-01T00:00:00.000Z",
  updated_at:  "2024-01-01T00:00:00.000Z",
  ...overrides,
});

const makeAgotadoItem = (): MenuItem =>
  makeMenuItem({
    id:        "223e4567-e89b-12d3-a456-426614174001",
    nombre:    "Mogolla Integral",
    disponible: false,
    destacado:  false,
  });

// ── Builder del mock de Supabase ──────────────────────────────────────────────
// Construimos el "query builder" fluent que devuelve Supabase.
// Cada llamada .from().select().order()... devuelve el mismo objeto
// hasta llegar al terminal que resuelve la Promise.

function buildSupabaseMock(terminal: Promise<{ data: unknown; error: null | { code: string; message: string } }>) {
  const queryBuilder = {
    select:  vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    single:  vi.fn().mockReturnValue(terminal),
    // Hacer que el queryBuilder en sí sea "thenable" para los casos sin .single()
    then:    (resolve: (v: unknown) => void) => terminal.then(resolve),
  };

  const client = {
    from: vi.fn().mockReturnValue(queryBuilder),
  };

  return { client, queryBuilder };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MenuRepository", () => {

  // ── getPublicMenu ───────────────────────────────────────────────────────────
  describe("getPublicMenu()", () => {
    it("devuelve array de MenuItems cuando la DB responde correctamente", async () => {
      const items = [makeMenuItem(), makeAgotadoItem()];

      const terminal = Promise.resolve({ data: items, error: null });
      const { client, queryBuilder } = buildSupabaseMock(terminal);

      // Necesitamos que el queryBuilder sea thenable (sin .single())
      // para este caso. Sobreescribimos then para que resuelva con data+error.
      (queryBuilder as Record<string, unknown>)["then"] = undefined;
      Object.assign(queryBuilder, {
        [Symbol.toStringTag]: "MockQuery",
      });
      // Para getPublicMenu que usa .order().order() sin .single():
      // Hacemos que la chain termine en una Promise directamente.
      client.from.mockReturnValue({
        ...queryBuilder,
        then: undefined,
        // La cadena .select().order().order() debe resolver como Promise
        order: vi.fn().mockImplementation(function(this: unknown) {
          // Primera llamada a order devuelve objeto con segunda llamada a order
          // Segunda llamada resuelve la Promise
          const self = this as Record<string, unknown>;
          if ((self["_orderCalled"] as boolean)) {
            return terminal;
          }
          self["_orderCalled"] = true;
          return self;
        }),
        select: vi.fn().mockReturnThis(),
        _orderCalled: false,
      });

      const repo = new MenuRepository(client as never);
      const result = await repo.getPublicMenu();

      expect(result).toHaveLength(2);
      expect(result[0]!.nombre).toBe("Pan de Achira");
      expect(result[1]!.disponible).toBe(false);
    });

    it("lanza MenuRepositoryError si la DB devuelve error", async () => {
      const terminal = Promise.resolve({ data: null, error: { code: "42501", message: "permission denied" } });
      const { client } = buildSupabaseMock(terminal);

      // Override para el flujo sin .single()
      client.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(function(this: unknown) {
          const self = this as Record<string, unknown>;
          if (self["_orderCalled"]) return terminal;
          self["_orderCalled"] = true;
          return self;
        }),
        _orderCalled: false,
      });

      const repo = new MenuRepository(client as never);

      await expect(repo.getPublicMenu()).rejects.toThrow(MenuRepositoryError);
      await expect(repo.getPublicMenu()).rejects.toMatchObject({
        code: "UNAUTHORIZED",
      });
    });
  });

  // ── createItem ──────────────────────────────────────────────────────────────
  describe("createItem()", () => {
    it("crea un producto con datos válidos y devuelve MenuItem", async () => {
      const created = makeMenuItem();
      const terminal = Promise.resolve({ data: created, error: null });
      const { client } = buildSupabaseMock(terminal);

      const repo = new MenuRepository(client as never);

      const input = {
        nombre:      "Pan de Achira",
        descripcion: "Pan tradicional de almidón de achira, crujiente por fuera y suave por dentro.",
        precio:      3500,
        emoji:       "🥐",
        cat:         "🥐 Panadería",
        destacado:   true,
        disponible:  true,
      };

      const result = await repo.createItem(input);

      expect(result.nombre).toBe("Pan de Achira");
      expect(result.precio).toBe(3500);
      expect(client.from).toHaveBeenCalledWith("menu_items");
    });

    it("lanza error VALIDATION cuando precio es 0", async () => {
      const terminal = Promise.resolve({ data: null, error: null });
      const { client } = buildSupabaseMock(terminal);

      const repo = new MenuRepository(client as never);

      const badInput = {
        nombre:      "Pan de Achira",
        descripcion: "Una descripción válida suficientemente larga",
        precio:      0, // ← inválido: debe ser > 0
        emoji:       "🥐",
        cat:         "🥐 Panadería",
        destacado:   false,
        disponible:  true,
      };

      await expect(repo.createItem(badInput)).rejects.toThrow(MenuRepositoryError);
      await expect(repo.createItem(badInput)).rejects.toMatchObject({
        code: "VALIDATION",
      });

      // La DB nunca debe ser contactada si la validación falla
      expect(client.from).not.toHaveBeenCalled();
    });

    it("lanza error VALIDATION cuando nombre está vacío", async () => {
      const terminal = Promise.resolve({ data: null, error: null });
      const { client } = buildSupabaseMock(terminal);

      const repo = new MenuRepository(client as never);

      await expect(
        repo.createItem({
          nombre:      "", // ← vacío
          descripcion: "Descripción válida del producto",
          precio:      5000,
          emoji:       "🥐",
          cat:         "🥐 Panadería",
          destacado:   false,
          disponible:  true,
        })
      ).rejects.toMatchObject({ code: "VALIDATION" });

      expect(client.from).not.toHaveBeenCalled();
    });

    it("lanza error VALIDATION cuando cat no está en la lista", async () => {
      const terminal = Promise.resolve({ data: null, error: null });
      const { client } = buildSupabaseMock(terminal);

      const repo = new MenuRepository(client as never);

      await expect(
        repo.createItem({
          nombre:      "Producto X",
          descripcion: "Descripción válida del producto",
          precio:      5000,
          emoji:       "🍽️",
          cat:         "🚫 Categoría Inventada", // ← no está en MENU_CATEGORIES
          destacado:   false,
          disponible:  true,
        })
      ).rejects.toMatchObject({ code: "VALIDATION" });
    });

    it("quita destacado automáticamente si disponible es false", async () => {
      const created = makeMenuItem({ destacado: false, disponible: false });
      const terminal = Promise.resolve({ data: created, error: null });
      const { client, queryBuilder } = buildSupabaseMock(terminal);

      let capturedInsertPayload: unknown;
      queryBuilder.insert.mockImplementation((payload: unknown) => {
        capturedInsertPayload = payload;
        return queryBuilder;
      });

      const repo = new MenuRepository(client as never);

      await repo.createItem({
        nombre:      "Mogolla Integral",
        descripcion: "Pan integral con semillas de girasol y linaza.",
        precio:      4200,
        emoji:       "🌾",
        cat:         "🥐 Panadería",
        destacado:   true,    // ← quiere destacado...
        disponible:  false,   // ← pero está agotado
      });

      // El invariante de negocio debe haber forzado destacado = false
      expect(capturedInsertPayload).toMatchObject({ destacado: false });
    });
  });

  // ── deleteItem ──────────────────────────────────────────────────────────────
  describe("deleteItem()", () => {
    it("lanza VALIDATION si el id está vacío", async () => {
      const terminal = Promise.resolve({ data: null, error: null });
      const { client } = buildSupabaseMock(terminal);

      const repo = new MenuRepository(client as never);

      await expect(repo.deleteItem("")).rejects.toMatchObject({
        code: "VALIDATION",
      });
      expect(client.from).not.toHaveBeenCalled();
    });

    it("llama a delete().eq() con el id correcto", async () => {
      const terminal = Promise.resolve({ data: null, error: null });
      const { client, queryBuilder } = buildSupabaseMock(terminal);

      // Para delete no hay .single() — la Promise termina en .eq()
      queryBuilder.eq.mockResolvedValue({ data: null, error: null });

      const repo = new MenuRepository(client as never);
      const id = "123e4567-e89b-12d3-a456-426614174000";

      await repo.deleteItem(id);

      expect(client.from).toHaveBeenCalledWith("menu_items");
      expect(queryBuilder.delete).toHaveBeenCalled();
      expect(queryBuilder.eq).toHaveBeenCalledWith("id", id);
    });
  });
});
