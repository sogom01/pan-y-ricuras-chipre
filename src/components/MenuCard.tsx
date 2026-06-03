"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/domain/menu-item";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

interface MenuCardProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

export default function MenuCard({ item, onClick }: MenuCardProps) {
  const [hov, setHov] = useState(false);
  const active = hov && item.disponible;

  return (
    <article
      onClick={() => item.disponible && onClick(item)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      // Accesibilidad: solo tabulable si está disponible
      tabIndex={item.disponible ? 0 : -1}
      onKeyDown={(e) => e.key === "Enter" && item.disponible && onClick(item)}
      role={item.disponible ? "button" : undefined}
      aria-label={item.disponible ? `Ver detalles de ${item.nombre}` : `${item.nombre} — agotado`}
      className="relative flex gap-3 items-start rounded-2xl p-[1.1rem] transition-all duration-[250ms]"
      style={{
        background:   active ? "#3a230d" : "#2e1c0a",
        border:       `1px solid ${active ? "rgba(201,158,76,0.4)" : "rgba(201,158,76,0.18)"}`,
        cursor:       item.disponible ? "pointer" : "default",
        transform:    active ? "translateY(-3px)" : "translateY(0)",
        boxShadow:    active ? "0 12px 30px rgba(0,0,0,0.45)" : "0 2px 8px rgba(0,0,0,0.25)",
        opacity:      item.disponible ? 1 : 0.45,
        // cubic-bezier elástico del prototipo — no hay clase Tailwind equivalente
        transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      {/* Shine line en hover — efecto del prototipo */}
      {active && (
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,158,76,0.5), transparent)" }}
        />
      )}

      {/* Emoji box */}
      <div
        aria-hidden="true"
        className="w-[50px] h-[50px] rounded-[13px] flex-shrink-0 flex items-center justify-center text-[26px]"
        style={{
          background: "linear-gradient(135deg, #3a230d, #231508)",
          border: "1px solid rgba(201,158,76,0.18)",
        }}
      >
        {item.emoji}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Nombre + estrella */}
        <div className="flex items-start justify-between gap-1.5 mb-1">
          <span
            className="font-serif text-base font-bold leading-tight"
            style={{ color: item.disponible ? "#f5ead8" : "rgba(245,234,216,0.25)" }}
          >
            {item.nombre}
          </span>
          {item.destacado && item.disponible && (
            <span aria-label="Destacado del día" className="text-sm flex-shrink-0 mt-px">⭐</span>
          )}
        </div>

        {/* Descripción — 2 líneas máximo */}
        <p
          className="text-[11px] font-sans leading-[1.5] mb-1.5 line-clamp-2"
          style={{ color: "rgba(245,234,216,0.35)" }}
        >
          {item.descripcion}
        </p>

        {/* Precio + CTA */}
        <div className="flex justify-between items-center">
          <span
            className="font-serif text-[1.1rem] font-bold"
            style={{ color: item.disponible ? "#c99e4c" : "rgba(245,234,216,0.25)" }}
          >
            {fmt(item.precio)}
          </span>

          {!item.disponible && (
            <span className="text-[10px] font-sans font-extrabold tracking-[0.8px]" style={{ color: "#c0392b" }}>
              AGOTADO
            </span>
          )}
          {item.disponible && (
            <span className="text-[11px] font-sans" style={{ color: "rgba(245,234,216,0.35)" }}>
              Ver más →
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
