"use client";

// ── Client Component para controles interactivos del panel admin ───────────────
// Gestiona el estado del modal de edición/creación y los toasts.
// Las operaciones de DB (toggle, delete, create, update) llaman a Server Actions
// importadas de @/app/admin/actions — Next.js las serializa y ejecuta en servidor.

import { useState, useTransition, useCallback } from "react";
import {
  createItemAction,
  updateItemAction,
  toggleDisponibleAction,
  deleteItemAction,
  logoutAction,
} from "@/app/admin/actions";
import AdminEditModal from "@/components/AdminEditModal";
import Toast          from "@/components/Toast";
import type { MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from "@/lib/domain/menu-item";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface AdminControlsProps {
  items:     MenuItem[];
  userEmail: string;
}

const EMPTY_ITEM: Partial<MenuItem> = {
  nombre:      "",
  descripcion: "",
  emoji:       "🍽️",
  cat:         "🥐 Panadería",
  destacado:   false,
  disponible:  true,
};

export default function AdminControls({ items, userEmail }: AdminControlsProps) {
  const [editingItem, setEditingItem] = useState<MenuItem | Partial<MenuItem> | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [isPending,   startTransition] = useTransition();

  const pushToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── Guardar (crear o actualizar) ───────────────────────────────────────────
  const handleSave = async (input: CreateMenuItemInput | UpdateMenuItemInput) => {
    const isUpdate = "id" in input && !!input.id;
    if (isUpdate) {
      await updateItemAction(input as UpdateMenuItemInput);
      pushToast("✓ Producto actualizado");
    } else {
      await createItemAction(input as CreateMenuItemInput);
      pushToast("✓ Producto añadido al menú");
    }
    setEditingItem(null);
    // revalidatePath en las actions hace que Next.js re-renderice el Server Component
    // con los datos frescos — no necesitamos actualizar estado local.
  };

  // ── Toggle disponible ──────────────────────────────────────────────────────
  const handleToggle = (id: string, disponible: boolean) => {
    startTransition(async () => {
      await toggleDisponibleAction(id, disponible);
      pushToast(disponible ? "✗ Marcado como agotado" : "✓ Marcado como disponible");
    });
  };

  // ── Eliminar ───────────────────────────────────────────────────────────────
  const handleDelete = (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteItemAction(id);
      pushToast("🗑 Producto eliminado");
    });
  };

  const disponibles = items.filter(i => i.disponible).length;
  const agotados    = items.length - disponibles;

  return (
    <>
      {/* ── Header del panel ──────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-10 px-4 py-3 flex justify-between items-center gap-4 flex-wrap"
        style={{
          background: "rgba(35,21,8,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(201,158,76,0.18)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <div className="font-sans text-sm font-bold" style={{ color: "#4a7c59" }}>
              Panel admin
            </div>
            <div className="font-sans text-xs" style={{ color: "rgba(245,234,216,0.35)" }}>
              {disponibles} disponibles · {agotados} agotados · {items.length} total
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => setEditingItem(EMPTY_ITEM)}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-sans font-extrabold cursor-pointer disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #c99e4c, #8b6110)", color: "#1a0f07" }}
          >
            + Nuevo producto
          </button>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg text-xs font-sans cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(201,158,76,0.18)",
                color: "rgba(245,234,216,0.55)",
              }}
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      {/* Email del admin */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-1">
        <p className="text-xs font-sans" style={{ color: "rgba(245,234,216,0.25)" }}>
          Sesión: {userEmail}
          {isPending && <span className="ml-2 opacity-60">· guardando…</span>}
        </p>
      </div>

      {/* ── Lista de productos ─────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-8">
        {items.map(item => (
          <div key={item.id} className="space-y-1.5">
            {/* Tarjeta del producto */}
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: "#2e1c0a",
                border: `1px solid ${item.disponible ? "rgba(201,158,76,0.18)" : "rgba(192,57,43,0.2)"}`,
                opacity: item.disponible ? 1 : 0.65,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #3a230d, #231508)",
                  border: "1px solid rgba(201,158,76,0.18)",
                }}
              >
                {item.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <span className="font-serif font-bold text-base leading-tight truncate" style={{ color: "#f5ead8" }}>
                    {item.nombre}
                  </span>
                  <div className="flex gap-1 flex-shrink-0 items-center">
                    {item.destacado && <span title="Destacado">⭐</span>}
                    {!item.disponible && (
                      <span
                        className="text-[10px] font-sans font-extrabold tracking-wide px-2 py-0.5 rounded-full"
                        style={{ color: "#c0392b", background: "rgba(192,57,43,0.12)" }}
                      >
                        AGOTADO
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs font-sans mb-2 line-clamp-1" style={{ color: "rgba(245,234,216,0.35)" }}>
                  {item.descripcion}
                </p>
                {/* Precio + botones — en móvil se apilan verticalmente */}
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 mt-1">
                  <span className="font-serif font-bold text-base" style={{ color: "#c99e4c" }}>
                    {fmt(item.precio)}
                  </span>

                  {/* Controles — flex-wrap para que no desborden en móvil */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => handleToggle(item.id, item.disponible)}
                      disabled={isPending}
                      className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-sans font-extrabold cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      style={{
                        background: item.disponible ? "rgba(74,124,89,0.12)" : "rgba(192,57,43,0.12)",
                        border:     item.disponible ? "1px solid rgba(74,124,89,0.28)" : "1px solid rgba(192,57,43,0.28)",
                        color:      item.disponible ? "#4a7c59" : "#c0392b",
                      }}
                    >
                      {item.disponible ? "✓ Disponible" : "✗ Agotado"}
                    </button>

                    <button
                      onClick={() => setEditingItem(item)}
                      disabled={isPending}
                      className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-sans font-extrabold cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      style={{
                        background: "rgba(201,158,76,0.1)",
                        border: "1px solid rgba(201,158,76,0.18)",
                        color: "#c99e4c",
                      }}
                    >
                      ✏ Editar
                    </button>

                    <button
                      onClick={() => handleDelete(item.id, item.nombre)}
                      disabled={isPending}
                      className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-sans font-extrabold cursor-pointer disabled:opacity-50 whitespace-nowrap"
                      style={{
                        background: "rgba(192,57,43,0.08)",
                        border: "1px solid rgba(192,57,43,0.2)",
                        color: "#c0392b",
                      }}
                    >
                      🗑 Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* ── Modales + Toast ────────────────────────────────────────────────── */}
      <AdminEditModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSave}
      />

      <Toast message={toast} />
    </>
  );
}
