-- ============================================================
-- MIGRACIÓN 002 — Row Level Security (RLS) en menu_items
-- Proyecto: Pan y Ricuras Chipre
-- ============================================================
-- Modelo de seguridad:
--   ROL anon      → clientes / cualquier visitante sin login
--                   Pueden VER items disponibles. Nada más.
--   ROL authenticated → staff admin logueado via Supabase Auth
--                   Pueden ver, crear, editar y borrar cualquier item.
--
-- IMPORTANTE: RLS se ejecuta en la BASE DE DATOS, no en JS.
-- Aunque alguien llame directamente a la API de Supabase con la
-- anon key pública, las políticas bloquean cualquier operación
-- no permitida antes de que los datos salgan de Postgres.
-- Esto implementa el principio "defense in depth" OWASP A01.
-- ============================================================

-- Activar RLS (obligatorio — sin esto las policies no tienen efecto)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- ── POLICY 1: Lectura pública ────────────────────────────────
-- Permite a cualquier visitante (rol anon) leer SOLO los items
-- donde disponible = true. Items agotados son invisibles para clientes.
-- El filtro está en la policy, no en el ORM — así aunque el
-- código de frontend olvide el filtro, la DB lo aplica igual.
CREATE POLICY "anon_select_disponible"
  ON public.menu_items
  FOR SELECT
  TO anon
  USING (disponible = true);

-- ── POLICY 2: Lectura completa para staff ───────────────────
-- El admin puede ver TODOS los items, incluyendo los agotados,
-- para poder reactivarlos desde el panel. Sin este SELECT
-- separado, el staff no vería items para editar.
CREATE POLICY "auth_select_all"
  ON public.menu_items
  FOR SELECT
  TO authenticated
  USING (true);  -- sin restricción de fila para staff autenticado

-- ── POLICY 3: Inserción para staff ──────────────────────────
-- Solo usuarios autenticados pueden agregar productos nuevos.
-- La anon key pública NO puede hacer INSERT — aunque alguien
-- intente atacar la API directamente, Postgres rechaza la operación.
CREATE POLICY "auth_insert"
  ON public.menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- validaciones de contenido las hace el CHECK constraint de la tabla

-- ── POLICY 4: Actualización para staff ──────────────────────
-- Staff puede editar cualquier producto (precio, disponibilidad, nombre, etc.)
-- USING: qué filas puede ver para editar (todas)
-- WITH CHECK: qué valores puede escribir (cualquier valor que pase los constraints)
CREATE POLICY "auth_update"
  ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ── POLICY 5: Eliminación para staff ────────────────────────
-- Staff puede eliminar productos. Se registra en updated_at del trigger
-- (aunque la fila desaparezca — para auditoría futura usar una tabla
-- menu_audit con trigger AFTER DELETE).
-- TODO(post-mvp): reemplazar DELETE real por soft-delete
--   (columna deleted_at) para no perder historia de precios.
CREATE POLICY "auth_delete"
  ON public.menu_items
  FOR DELETE
  TO authenticated
  USING (true);

-- ── Verificación post-migración (ejecutar manualmente en SQL editor) ─
-- SELECT schemaname, tablename, rowsecurity
--   FROM pg_tables
--   WHERE tablename = 'menu_items';
-- → rowsecurity debe ser TRUE

-- SELECT polname, polcmd, polroles
--   FROM pg_policies
--   WHERE tablename = 'menu_items'
--   ORDER BY polcmd;
-- → debe listar las 5 policies creadas arriba
