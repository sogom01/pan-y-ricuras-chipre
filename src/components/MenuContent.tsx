"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { MENU_CATEGORIES, type MenuItem } from "@/lib/domain/menu-item";
import ItemModal from "@/components/ItemModal";

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

const PAGES = ["portada", ...MENU_CATEGORIES] as const;
const TOTAL = PAGES.length;

interface Props {
  initialItems: MenuItem[];
}

export default function MenuContent({ initialItems }: Props) {
  const [current, setCurrent]       = useState(0);
  const [direction, setDirection]   = useState<"forward" | "backward">("forward");
  const [selectedItem, setSelected] = useState<MenuItem | null>(null);
  const tabsRef                     = useRef<HTMLDivElement>(null);
  const touchStartX                 = useRef(0);

  const goTo = useCallback((i: number) => {
    const target = Math.max(0, Math.min(TOTAL - 1, i));
    setDirection(target >= current ? "forward" : "backward");
    setCurrent(target);
  }, [current]);

  const handleCloseModal = useCallback(() => setSelected(null), []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(current + 1);
      if (e.key === "ArrowLeft")  goTo(current - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  // Scroll active tab into view
  useEffect(() => {
    const btn = tabsRef.current?.querySelector<HTMLButtonElement>(`[data-idx="${current}"]`);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [current]);

  const catItems = (cat: string) =>
    initialItems.filter((i) => i.cat === cat && i.disponible);

  const currentCatName = current === 0 ? "Portada" : PAGES[current] as string;

  return (
    <>
      <div
        style={{
          background: "#1C0F08",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Background texture */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 20% 20%, rgba(107,63,31,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(107,63,31,0.1) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header
          style={{
            width: "100%",
            textAlign: "center",
            padding: "3rem 1rem 2rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontSize: "1.5rem",
              color: "#B8860B",
              letterSpacing: "0.5em",
              opacity: 0.7,
              marginBottom: "0.5rem",
            }}
          >
            ✦ ✦ ✦
          </div>
          <h1
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
              color: "#F5EDD9",
              lineHeight: 1,
              marginBottom: "0.25rem",
              textShadow: "0 2px 20px rgba(0,0,0,0.5)",
              fontWeight: 700,
            }}
          >
            Pan y Ricuras
          </h1>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#B8860B",
              opacity: 0.8,
            }}
          >
            Chipre · Panadería &amp; Repostería · Manizales
          </p>
        </header>

        {/* ── Book ───────────────────────────────────────────────────────────── */}
        <main
          style={{
            width: "100%",
            maxWidth: 900,
            padding: "0 1rem 4rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "#6B3F1F",
              borderRadius: "4px 12px 12px 4px",
              boxShadow:
                "0 30px 80px rgba(44,24,16,0.35), 0 8px 20px rgba(44,24,16,0.2)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Spine */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 18,
                height: "100%",
                background:
                  "linear-gradient(to right, #4a2a0f, #7a4f25, #4a2a0f)",
                zIndex: 20,
                boxShadow: "2px 0 8px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "0.5rem",
                  letterSpacing: "0.3em",
                  color: "#B8860B",
                  opacity: 0.7,
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                }}
              >
                CARTA
              </span>
            </div>

            {/* Pages area */}
            <div
              style={{ marginLeft: 18, background: "#F5EDD9", minHeight: 600 }}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(dx) > 50) {
                  if (dx < 0) goTo(current + 1);
                  else        goTo(current - 1);
                }
              }}
            >
              {/* ── Tabs ─────────────────────────────────────────────────────── */}
              <div
                ref={tabsRef}
                className="no-scrollbar"
                style={{
                  display: "flex",
                  overflowX: "auto",
                  background: "#EBE0C4",
                  borderBottom: "2px solid rgba(107,63,31,0.2)",
                }}
              >
                {PAGES.map((page, i) => {
                  const active = current === i;
                  const icon   = i === 0 ? "☕" : (page as string).split(" ")[0];
                  const label  = i === 0 ? "Portada" : (page as string).replace(/^\S+\s/, "");
                  return (
                    <button
                      key={page}
                      data-idx={i}
                      onClick={() => goTo(i)}
                      aria-pressed={active}
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.875rem 1.1rem",
                        background: active ? "#F5EDD9" : "none",
                        border: "none",
                        borderBottom: active ? "2px solid #6B3F1F" : "2px solid transparent",
                        cursor: "pointer",
                        fontFamily: "sans-serif",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: active ? "#6B3F1F" : "rgba(61,43,31,0.45)",
                        whiteSpace: "nowrap",
                        transition: "all 0.25s",
                      }}
                    >
                      <span style={{ fontSize: "1.3rem", lineHeight: 1 }}>{icon}</span>
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Page content ─────────────────────────────────────────────── */}
              <div
                key={current}
                className={direction === "forward" ? "animate-page-forward" : "animate-page-backward"}
                style={{ padding: "clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 5vw, 3rem) 3rem" }}
              >
                {current === 0 ? (
                  /* Cover page */
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <div style={{ fontSize: "1rem", letterSpacing: "0.4em", color: "#B8860B", opacity: 0.5, marginBottom: "1.5rem" }}>
                      — ✦ —
                    </div>
                    <h2
                      style={{
                        fontFamily: "Georgia, serif",
                        fontSize: "clamp(2.5rem, 7vw, 4rem)",
                        color: "#2C1810",
                        lineHeight: 1,
                        marginBottom: "0.5rem",
                        fontWeight: 700,
                      }}
                    >
                      Pan y Ricuras
                    </h2>
                    <p
                      style={{
                        fontFamily: "Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "1rem",
                        color: "#9B6240",
                        marginBottom: "2rem",
                      }}
                    >
                      Panadería artesanal desde el corazón de Chipre
                    </p>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", margin: "1.5rem 0" }}>
                      <div style={{ width: 80, height: 1, background: "linear-gradient(to right, transparent, #9B6240)" }} />
                      <span style={{ fontSize: "1.3rem", color: "#9B6240" }}>🥐</span>
                      <div style={{ width: 80, height: 1, background: "linear-gradient(to left, transparent, #9B6240)" }} />
                    </div>

                    <p
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: "0.75rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "rgba(61,43,31,0.4)",
                        lineHeight: 2,
                      }}
                    >
                      Carrera 23 #71‑45, Chipre<br />
                      Manizales, Colombia
                    </p>

                    <button
                      onClick={() => goTo(1)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        marginTop: "2.5rem",
                        padding: "0.875rem 2.5rem",
                        background: "#6B3F1F",
                        color: "#F5EDD9",
                        fontFamily: "Georgia, serif",
                        fontSize: "0.8rem",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        border: "none",
                        borderRadius: 2,
                        cursor: "pointer",
                        transition: "background 0.25s, transform 0.25s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#2C1810";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "#6B3F1F";
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                      }}
                    >
                      Ver nuestra carta &nbsp; →
                    </button>

                    <div style={{ fontSize: "1rem", letterSpacing: "0.4em", color: "#B8860B", opacity: 0.5, marginTop: "2rem" }}>
                      — ✦ —
                    </div>
                  </div>
                ) : (
                  /* Category page */
                  (() => {
                    const catName = MENU_CATEGORIES[current - 1];
                    const items   = catItems(catName);
                    const icon    = catName.split(" ")[0];
                    const label   = catName.replace(/^\S+\s/, "");

                    return (
                      <div>
                        {/* Page header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            marginBottom: "2rem",
                            paddingBottom: "1rem",
                            borderBottom: "1px solid rgba(107,63,31,0.15)",
                            position: "relative",
                          }}
                        >
                          <div
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              bottom: -4,
                              left: 0,
                              width: 60,
                              height: 2,
                              background: "#6B3F1F",
                              opacity: 0.4,
                            }}
                          />
                          <h2
                            style={{
                              fontFamily: "Georgia, serif",
                              fontSize: "clamp(1.6rem, 4vw, 2.5rem)",
                              fontWeight: 700,
                              color: "#2C1810",
                              lineHeight: 1.1,
                            }}
                          >
                            <em style={{ fontStyle: "italic", color: "#9B6240" }}>{icon}</em>{" "}
                            {label}
                          </h2>
                          <span
                            style={{
                              fontFamily: "Georgia, serif",
                              fontSize: "0.7rem",
                              letterSpacing: "0.2em",
                              color: "rgba(107,63,31,0.35)",
                              textTransform: "uppercase",
                              flexShrink: 0,
                              marginLeft: "1rem",
                            }}
                          >
                            {current} / {TOTAL - 1}
                          </span>
                        </div>

                        {/* Items */}
                        {items.length === 0 ? (
                          <p
                            style={{
                              fontFamily: "Georgia, serif",
                              fontStyle: "italic",
                              color: "rgba(61,43,31,0.4)",
                              textAlign: "center",
                              padding: "3rem 0",
                            }}
                          >
                            Sin productos disponibles en esta categoría
                          </p>
                        ) : (
                          <div>
                            {items.map((item, idx) => (
                              <div
                                key={item.id}
                                onClick={() => setSelected(item)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && setSelected(item)}
                                aria-label={`Ver detalles de ${item.nombre}`}
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr auto",
                                  alignItems: "baseline",
                                  gap: "1rem",
                                  padding: "0.9rem 0",
                                  borderBottom:
                                    idx < items.length - 1
                                      ? "1px dashed rgba(107,63,31,0.12)"
                                      : "none",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={(e) => {
                                  (e.currentTarget as HTMLDivElement).style.background = "rgba(107,63,31,0.04)";
                                  (e.currentTarget as HTMLDivElement).style.margin = "0 -1rem";
                                  (e.currentTarget as HTMLDivElement).style.padding = "0.9rem 1rem";
                                  (e.currentTarget as HTMLDivElement).style.borderRadius = "4px";
                                }}
                                onMouseLeave={(e) => {
                                  (e.currentTarget as HTMLDivElement).style.background = "";
                                  (e.currentTarget as HTMLDivElement).style.margin = "";
                                  (e.currentTarget as HTMLDivElement).style.padding = "0.9rem 0";
                                  (e.currentTarget as HTMLDivElement).style.borderRadius = "";
                                }}
                              >
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                    {item.destacado && (
                                      <span
                                        aria-label="Destacado"
                                        style={{ color: "#B8860B", fontSize: "0.7rem", opacity: 0.7 }}
                                      >
                                        ★
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        fontFamily: "Georgia, serif",
                                        fontSize: "1rem",
                                        fontWeight: 600,
                                        color: "#2C1810",
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      {item.emoji} {item.nombre}
                                    </span>
                                  </div>
                                  {item.descripcion && (
                                    <p
                                      style={{
                                        fontSize: "0.78rem",
                                        color: "rgba(61,43,31,0.5)",
                                        lineHeight: 1.55,
                                        marginTop: "0.2rem",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      {item.descripcion}
                                    </p>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontFamily: "Georgia, serif",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "#6B3F1F",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {fmt(item.precio)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>

              {/* ── Bottom nav ───────────────────────────────────────────────── */}
              <div
                style={{
                  background: "#EBE0C4",
                  borderTop: "1px solid rgba(107,63,31,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.875rem 1.5rem",
                }}
              >
                <button
                  onClick={() => goTo(current - 1)}
                  disabled={current === 0}
                  aria-label="Página anterior"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "none",
                    border: "1px solid rgba(107,63,31,0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: 2,
                    fontFamily: "sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9B6240",
                    cursor: current === 0 ? "not-allowed" : "pointer",
                    opacity: current === 0 ? 0.3 : 1,
                    transition: "all 0.25s",
                  }}
                >
                  <span>←</span>
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "0.85rem",
                      fontStyle: "italic",
                      color: "#6B3F1F",
                    }}
                  >
                    {currentCatName}
                  </div>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: "0.4rem" }}>
                    {PAGES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={`Ir a página ${i}`}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background:
                            current === i ? "#6B3F1F" : "rgba(107,63,31,0.2)",
                          border: "none",
                          cursor: "pointer",
                          transform: current === i ? "scale(1.4)" : "scale(1)",
                          transition: "all 0.25s",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => goTo(current + 1)}
                  disabled={current === TOTAL - 1}
                  aria-label="Página siguiente"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "none",
                    border: "1px solid rgba(107,63,31,0.2)",
                    padding: "0.5rem 1rem",
                    borderRadius: 2,
                    fontFamily: "sans-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#9B6240",
                    cursor: current === TOTAL - 1 ? "not-allowed" : "pointer",
                    opacity: current === TOTAL - 1 ? 0.3 : 1,
                    transition: "all 0.25s",
                  }}
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <span>→</span>
                </button>
              </div>
            </div>
            {/* /pages */}
          </div>
          {/* /book-container */}
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer
          style={{
            textAlign: "center",
            padding: "1.5rem",
            position: "relative",
            zIndex: 10,
            width: "100%",
          }}
        >
          <p
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              color: "rgba(240,220,180,0.2)",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
            }}
          >
            Pan y Ricuras Chipre · Carrera 23 #71‑45, Manizales · Los precios incluyen IVA
          </p>
          <a
            href="/admin/login"
            aria-label="Acceso administrador"
            style={{
              position: "absolute",
              right: "1.5rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(245,234,216,0.2)",
              textDecoration: "none",
              fontSize: "0.75rem",
            }}
          >
            🔑
          </a>
        </footer>
      </div>

      <ItemModal item={selectedItem} onClose={handleCloseModal} />
    </>
  );
}
