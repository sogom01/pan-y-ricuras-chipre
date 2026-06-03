"use client";

import { useEffect, useRef, useCallback } from "react";
import type { MenuItem } from "@/lib/domain/menu-item";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const handleEsc = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); },
    [onClose]
  );

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

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:p-4"
      style={{ background: "rgba(10,5,2,0.92)", backdropFilter: "blur(12px)" }}
      aria-label="Cerrar detalle del producto"
    >
      {/* Panel — sube desde abajo (sheet pattern, ideal para móvil) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        // p-5 en móvil → p-8 en ≥ sm. Rounded solo arriba en móvil como bottom-sheet.
        className="relative w-full max-w-[440px] rounded-t-[22px] sm:rounded-[22px] overflow-hidden animate-slide-up"
        style={{
          background: "linear-gradient(160deg, #2e1c0a, #231508)",
          border: "1px solid rgba(201,158,76,0.4)",
          // Limitar altura en móvil para no taparlo todo
          maxHeight: "90dvh",
          overflowY: "auto",
          padding: "clamp(1.25rem, 5vw, 2rem)",
        }}
      >
        {/* Línea dorada superior */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, transparent, #c99e4c, transparent)" }}
        />

        {/* Pill de arrastre — solo en móvil como indicador de bottom-sheet */}
        <div
          aria-hidden="true"
          className="block sm:hidden w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: "rgba(201,158,76,0.3)" }}
        />

        {/* Emoji + botón cerrar */}
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <span
            aria-hidden="true"
            // clamp: 40px en móvil muy pequeño → 56px en pantallas ≥ 400px
            style={{ fontSize: "clamp(2.5rem, 10vw, 3.5rem)", lineHeight: 1 }}
          >
            {item.emoji}
          </span>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex items-center justify-center w-[34px] h-[34px] rounded-[9px] text-base cursor-pointer flex-shrink-0 ml-2"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,158,76,0.18)",
              color: "rgba(245,234,216,0.55)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Badge destacado */}
        {item.destacado && (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-sans font-extrabold tracking-[0.8px] mb-2"
            style={{
              background: "rgba(201,158,76,0.1)",
              border: "1px solid rgba(201,158,76,0.25)",
              color: "#c99e4c",
            }}
          >
            ⭐ Destacado del día
          </span>
        )}

        {/* Título */}
        <h2
          id="modal-title"
          className="font-serif font-bold leading-tight mt-2 mb-3"
          style={{
            fontSize: "clamp(1.25rem, 5vw, 1.6rem)",
            color: "#f5ead8",
          }}
        >
          {item.nombre}
        </h2>

        {/* Descripción */}
        <p
          className="font-sans leading-[1.7] mb-5 sm:mb-6"
          style={{
            fontSize: "clamp(0.8rem, 3vw, 0.875rem)",
            color: "rgba(245,234,216,0.55)",
          }}
        >
          {item.descripcion}
        </p>

        {/* Precio + CTA */}
        <div
          className="flex justify-between items-center pt-3.5 sm:pt-4"
          style={{ borderTop: "1px solid rgba(201,158,76,0.18)" }}
        >
          <div>
            <div
              className="text-[10px] font-sans font-extrabold tracking-[1.5px] mb-0.5"
              style={{ color: "rgba(245,234,216,0.25)" }}
            >
              PRECIO
            </div>
            <div
              className="font-serif font-bold"
              style={{
                fontSize: "clamp(1.5rem, 6vw, 2rem)",
                color: "#c99e4c",
              }}
            >
              {fmt(item.precio)}
            </div>
          </div>
          <div
            className="font-sans text-right leading-[1.5]"
            style={{
              fontSize: "clamp(0.75rem, 2.5vw, 0.8125rem)",
              color: "rgba(245,234,216,0.35)",
              maxWidth: 140,
            }}
          >
            Pídelo a nuestra
            <br />
            <span className="font-bold" style={{ color: "#e8c97a" }}>mesera 🙋‍♀️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
