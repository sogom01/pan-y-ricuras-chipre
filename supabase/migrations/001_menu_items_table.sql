-- ============================================================
-- MIGRACIÓN 001 — Tabla principal: menu_items
-- Proyecto: Pan y Ricuras Chipre
-- ============================================================
-- Decisiones de diseño:
--   • uuid como PK: resistente a enumeración (vs integer secuencial)
--   • precio en INTEGER (centavos COP enteros — sin decimales en COP real)
--     → Los precios del menú son múltiplos de 50/100 COP siempre.
--       Almacenar como integer elimina errores de punto flotante.
--   • cat como TEXT con CHECK: evita tabla de categorías separada para
--     un MVP de escala baja. Si las categorías crecen, migrar a FK.
--   • updated_at se actualiza con trigger para no depender del cliente.
-- ============================================================

-- Extensión para UUID v4 (ya viene en Supabase pero la declaramos explícita)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabla menu_items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido del producto
  nombre       TEXT         NOT NULL CHECK (char_length(nombre) BETWEEN 1 AND 120),
  descripcion  TEXT         NOT NULL CHECK (char_length(descripcion) BETWEEN 1 AND 400),
  precio       INTEGER      NOT NULL CHECK (precio > 0),  -- en COP, sin decimales
  emoji        TEXT         NOT NULL DEFAULT '🍽️' CHECK (char_length(emoji) BETWEEN 1 AND 10),

  -- Clasificación
  cat          TEXT         NOT NULL CHECK (cat IN (
    '🥐 Panadería',
    '🍰 Repostería',
    '☕ Bebidas Calientes',
    '🧋 Bebidas Frías',
    '🍳 Desayunos',
    '🥪 Almuerzos'
  )),

  -- Estado
  destacado    BOOLEAN      NOT NULL DEFAULT false,
  disponible   BOOLEAN      NOT NULL DEFAULT true,

  -- Auditoría
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ── Índices ─────────────────────────────────────────────────

-- Filtro por categoría (operación más frecuente en la carta pública)
CREATE INDEX IF NOT EXISTS idx_menu_items_cat
  ON public.menu_items (cat);

-- Filtro por disponibilidad (la carta pública solo muestra disponibles)
CREATE INDEX IF NOT EXISTS idx_menu_items_disponible
  ON public.menu_items (disponible)
  WHERE disponible = true;  -- índice parcial: solo indexa los disponibles

-- Orden por nombre dentro de una categoría (consulta secundaria frecuente)
CREATE INDEX IF NOT EXISTS idx_menu_items_cat_nombre
  ON public.menu_items (cat, nombre);

-- ── Trigger: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Comentarios de columnas (documentación en DB) ───────────
COMMENT ON TABLE  public.menu_items              IS 'Productos del menú de Pan y Ricuras Chipre';
COMMENT ON COLUMN public.menu_items.precio       IS 'Precio en pesos colombianos (COP), entero sin decimales';
COMMENT ON COLUMN public.menu_items.cat          IS 'Categoría del producto — valor de lista cerrada';
COMMENT ON COLUMN public.menu_items.destacado    IS 'Aparece con badge Destacado del día — requiere disponible = true para tener efecto';
COMMENT ON COLUMN public.menu_items.disponible   IS 'false = agotado, oculto en vista pública, visible con badge en vista admin';
