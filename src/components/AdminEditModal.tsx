"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ZodError } from "zod";
import {
  MENU_CATEGORIES,
  parseCreateInput,
  parseUpdateInput,
  type MenuItem,
  type MenuCategory,
  type CreateMenuItemInput,
  type UpdateMenuItemInput,
} from "@/lib/domain/menu-item";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface FormState {
  id?:         string;
  nombre:      string;
  descripcion: string;
  precio:      number | "";
  emoji:       string;
  cat:         MenuCategory;
  destacado:   boolean;
  disponible:  boolean;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

interface AdminEditModalProps {
  item:    MenuItem | Partial<MenuItem> | null;
  onClose: () => void;
  onSave:  (input: CreateMenuItemInput | UpdateMenuItemInput) => Promise<void>;
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function toFormState(item: Partial<MenuItem>): FormState {
  return {
    id:          item.id,
    nombre:      item.nombre      ?? "",
    descripcion: item.descripcion ?? "",
    precio:      item.precio      ?? "",
    emoji:       item.emoji       ?? "🍽️",
    cat:         item.cat         ?? MENU_CATEGORIES[0],
    destacado:   item.destacado   ?? false,
    disponible:  item.disponible  ?? true,
  };
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function AdminEditModal({ item, onClose, onSave }: AdminEditModalProps) {
  const [form,    setForm]    = useState<FormState>(() => toFormState(item ?? {}));
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [saving,  setSaving]  = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const isEdit = !!form.id;

  // Sincronizar form cuando cambia el item (ej. abriendo diferente producto)
  useEffect(() => {
    setForm(toFormState(item ?? {}));
    setErrors({});
    setApiError(null);
  }, [item]);

  const upd = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // ── Escape + focus trap ────────────────────────────────────────────────────
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && !saving) onClose();
  }, [onClose, saving]);

  useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    previousFocusRef.current = document.activeElement as HTMLElement;

    const modal = dialogRef.current;
    if (modal) {
      modal.querySelectorAll<HTMLElement>(FOCUSABLE)[0]?.focus();

      const trapTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;
        const els   = modal.querySelectorAll<HTMLElement>(FOCUSABLE);
        const first = els[0];
        const last  = els[els.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
        }
      };

      document.addEventListener("keydown", trapTab);
      document.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("keydown", trapTab);
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
        previousFocusRef.current?.focus();
      };
    }
  }, [item, handleEsc]);

  // ── Validación y envío ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setApiError(null);

    // Construir el payload tipado
    const payload = {
      ...form,
      precio: typeof form.precio === "string" ? 0 : form.precio,
    };

    try {
      // Validación client-side con Zod antes de llamar al servidor
      if (isEdit) {
        parseUpdateInput(payload);
      } else {
        parseCreateInput(payload);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        err.issues.forEach(issue => {
          const field = issue.path[0] as keyof FormState | undefined;
          if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
      }
      return;
    }

    // Si la validación pasó, llamar al servidor
    setSaving(true);
    try {
      await onSave(
        isEdit
          ? (payload as UpdateMenuItemInput)
          : (payload as CreateMenuItemInput)
      );
      // onSave cierra el modal desde el llamador (AdminControls)
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Error al guardar. Intenta de nuevo."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  // ── Helpers de estilo ──────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(201,158,76,0.18)",
    borderRadius: 10,
    padding: "9px 13px",
    color: "#f5ead8",
    fontSize: 13,
    outline: "none",
    fontFamily: "var(--font-sans)",
  } as const;

  const errorStyle = { color: "#c0392b", fontSize: 11, marginTop: 3, fontFamily: "var(--font-sans)" };

  const labelStyle = {
    fontSize: 10,
    color: "#c99e4c",
    fontFamily: "var(--font-sans)",
    letterSpacing: "1.5px",
    fontWeight: 800,
    display: "block",
    marginBottom: 5,
  } as const;

  return (
    <div
      onClick={() => !saving && onClose()}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(10,5,2,0.93)", backdropFilter: "blur(12px)" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-[22px] p-7 animate-slide-up overflow-y-auto"
        style={{
          background: "linear-gradient(155deg, #2e1c0a, #231508)",
          border: "1px solid rgba(201,158,76,0.4)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2
            id="edit-modal-title"
            className="font-serif text-[1.4rem] font-bold"
            style={{ color: "#f5ead8" }}
          >
            {isEdit ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cancelar y cerrar"
            className="flex items-center justify-center w-[34px] h-[34px] rounded-[9px] text-base cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(201,158,76,0.18)",
              color: "rgba(245,234,216,0.55)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Error de API */}
        {apiError && (
          <div
            className="mb-4 px-4 py-2 rounded-xl text-sm font-sans"
            style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b" }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* Nombre */}
          <div>
            <label htmlFor="edit-nombre" style={labelStyle}>NOMBRE *</label>
            <input
              id="edit-nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => upd("nombre", e.target.value)}
              placeholder="Ej: Croissant de mantequilla"
              maxLength={120}
              aria-invalid={!!errors.nombre}
              aria-describedby={errors.nombre ? "err-nombre" : undefined}
              style={inputStyle}
            />
            {errors.nombre && <p id="err-nombre" role="alert" style={errorStyle}>{errors.nombre}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="edit-desc" style={labelStyle}>DESCRIPCIÓN *</label>
            <textarea
              id="edit-desc"
              value={form.descripcion}
              onChange={(e) => upd("descripcion", e.target.value)}
              rows={3}
              placeholder="Describe el producto brevemente…"
              maxLength={400}
              aria-invalid={!!errors.descripcion}
              aria-describedby={errors.descripcion ? "err-desc" : undefined}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            {errors.descripcion && <p id="err-desc" role="alert" style={errorStyle}>{errors.descripcion}</p>}
          </div>

          {/* Precio + Emoji */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-precio" style={labelStyle}>PRECIO (COP) *</label>
              <input
                id="edit-precio"
                type="number"
                min={1}
                step={50}
                value={form.precio}
                onChange={(e) => upd("precio", e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="8500"
                aria-invalid={!!errors.precio}
                aria-describedby={errors.precio ? "err-precio" : undefined}
                style={inputStyle}
              />
              {errors.precio && <p id="err-precio" role="alert" style={errorStyle}>{errors.precio}</p>}
            </div>
            <div>
              <label htmlFor="edit-emoji" style={labelStyle}>EMOJI</label>
              <input
                id="edit-emoji"
                type="text"
                value={form.emoji}
                onChange={(e) => upd("emoji", e.target.value)}
                placeholder="☕"
                maxLength={10}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="edit-cat" style={labelStyle}>CATEGORÍA *</label>
            <select
              id="edit-cat"
              value={form.cat}
              onChange={(e) => upd("cat", e.target.value as MenuCategory)}
              aria-invalid={!!errors.cat}
              style={{ ...inputStyle, background: "#2e1c0a" }}
            >
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: "#2e1c0a" }}>{c}</option>
              ))}
            </select>
            {errors.cat && <p role="alert" style={errorStyle}>{errors.cat}</p>}
          </div>

          {/* Checkboxes */}
          <div className="flex gap-4 flex-wrap">
            {([
              ["destacado", "⭐ Destacado del día"] as const,
              ["disponible", "✓ Disponible"]        as const,
            ]).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-1.5 cursor-pointer font-sans text-[13px]"
                style={{ color: "rgba(245,234,216,0.55)" }}
              >
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => upd(key, e.target.checked)}
                  style={{ accentColor: "#c99e4c", width: 16, height: 16 }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Acciones */}
          <div className="flex gap-2.5 mt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-sans font-extrabold cursor-pointer disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c99e4c, #8b6110)",
                border: "none",
                color: "#1a0f07",
              }}
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-3 rounded-xl text-[13px] font-sans cursor-pointer disabled:opacity-60"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(201,158,76,0.18)",
                color: "rgba(245,234,216,0.55)",
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
