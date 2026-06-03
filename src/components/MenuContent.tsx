"use client";

import { useState, useMemo, useCallback } from "react";
import { MENU_CATEGORIES, type MenuItem } from "@/lib/domain/menu-item";
import MenuCard  from "@/components/MenuCard";
import ItemModal from "@/components/ItemModal";

const ALL_CATS = ["Todo el menú", ...MENU_CATEGORIES] as const;
type CatFilter = (typeof ALL_CATS)[number];

interface MenuContentProps {
  initialItems: MenuItem[];
}

export default function MenuContent({ initialItems }: MenuContentProps) {
  const [search,       setSearch]       = useState("");
  const [selectedCat,  setSelectedCat]  = useState<CatFilter>("Todo el menú");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleCloseModal = useCallback(() => setSelectedItem(null), []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return initialItems.filter(item => {
      const matchCat    = selectedCat === "Todo el menú" || item.cat === selectedCat;
      const matchSearch = !s ||
        item.nombre.toLowerCase().includes(s) ||
        item.descripcion.toLowerCase().includes(s);
      return matchCat && matchSearch;
    });
  }, [initialItems, selectedCat, search]);

  const grouped = useMemo(() => {
    if (selectedCat !== "Todo el menú") return { [selectedCat]: filtered };
    return MENU_CATEGORIES.reduce<Record<string, MenuItem[]>>((acc, cat) => {
      const items = filtered.filter(i => i.cat === cat);
      if (items.length > 0) acc[cat] = items;
      return acc;
    }, {});
  }, [filtered, selectedCat]);

  return (
    <>
      <div className="min-h-screen font-sans" style={{ background: "#1a0f07", color: "#f5ead8" }}>

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <header
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, #231508 0%, #1a0f07 100%)",
            borderBottom: "1px solid rgba(201,158,76,0.18)",
          }}
        >
          {/* Textura punteada */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(201,158,76,0.094) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow dorado */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: -80, left: "50%", transform: "translateX(-50%)",
              width: 500, height: 300, borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(201,158,76,0.094) 0%, transparent 70%)",
            }}
          />

          {/* ── Contenido del hero ─────────────────────────────────────────── */}
          {/* px-4 en móvil → px-6 en pantallas ≥ sm (640px) */}
          <div className="relative max-w-[720px] mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-6 sm:pb-8 text-center">

            {/* Logo */}
            <div className="inline-flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
              <div
                aria-hidden="true"
                className="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-[12px] sm:rounded-[14px] flex items-center justify-center text-[22px] sm:text-[26px] flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #c99e4c, #6b4a0a)",
                  boxShadow: "0 0 24px rgba(201,158,76,0.33)",
                }}
              >
                🥐
              </div>
              <div className="text-left min-w-0">
                <div
                  className="font-serif font-bold leading-[1.05] tracking-[0.5px]"
                  style={{ fontSize: "clamp(1.3rem, 5vw, 2.2rem)", color: "#e8c97a" }}
                >
                  Pan y Ricuras
                </div>
                <div
                  className="font-sans font-extrabold"
                  style={{ fontSize: "clamp(7px, 2vw, 9px)", color: "#c99e4c", letterSpacing: "clamp(2px, 1vw, 4px)" }}
                >
                  CHIPRE · PANADERÍA &amp; REPOSTERÍA
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p
              className="font-serif italic leading-[1.6] mx-auto mb-5 sm:mb-7"
              style={{
                fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                color: "rgba(245,234,216,0.55)",
                maxWidth: "min(380px, 90%)",
              }}
            >
              "Bienvenido — explora nuestra carta y dile a la mesera qué deseas pedir 🙋‍♀️"
            </p>

            {/* Línea decorativa */}
            <div aria-hidden="true" className="flex items-center gap-3 justify-center mb-5 sm:mb-6">
              <div className="flex-1 max-w-[80px] h-px" style={{ background: "linear-gradient(90deg, transparent, #c99e4c)" }} />
              <span style={{ fontSize: 16 }}>✦</span>
              <div className="flex-1 max-w-[80px] h-px" style={{ background: "linear-gradient(90deg, #c99e4c, transparent)" }} />
            </div>

            {/* Búsqueda — full width en móvil, max 400px en desktop */}
            <div className="relative w-full max-w-[400px] mx-auto">
              <span
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none"
                style={{ color: "rgba(245,234,216,0.35)" }}
              >
                🔍
              </span>
              <label htmlFor="menu-search" className="sr-only">Buscar en el menú</label>
              <input
                id="menu-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar en el menú…"
                className="w-full rounded-full py-2.5 pl-10 pr-4 text-[13px] font-sans transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(201,158,76,0.18)",
                  color: "#f5ead8",
                  outline: "none",
                }}
                onFocus={(e)  => (e.target.style.borderColor = "rgba(201,158,76,0.4)")}
                onBlur={(e)   => (e.target.style.borderColor = "rgba(201,158,76,0.18)")}
              />
            </div>
          </div>

          {/* ── Filtros de categoría ────────────────────────────────────────── */}
          {/* no-scrollbar oculta el scrollbar nativo en móvil sin romper el scroll */}
          {/* justify-start en móvil (scroll desde izq) → justify-center en ≥ sm */}
          <nav aria-label="Filtrar por categoría" className="overflow-x-auto no-scrollbar pb-4 sm:pb-5 px-4">
            <ul
              className="flex gap-1.5 sm:justify-center"
              style={{ minWidth: "max-content", listStyle: "none" }}
            >
              {ALL_CATS.map((cat) => {
                const active = selectedCat === cat;
                return (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCat(cat)}
                      aria-pressed={active}
                      className="px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-sans whitespace-nowrap transition-all duration-200 cursor-pointer"
                      style={{
                        background: active ? "linear-gradient(135deg, #c99e4c, #8b6110)" : "rgba(255,255,255,0.05)",
                        border:     active ? "1px solid transparent" : "1px solid rgba(201,158,76,0.18)",
                        color:      active ? "#1a0f07" : "rgba(245,234,216,0.55)",
                        fontWeight: active ? 800 : 500,
                        boxShadow:  active ? "0 0 14px rgba(201,158,76,0.25)" : "none",
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        {/* ── Carta ────────────────────────────────────────────────────────── */}
        {/* pb-28 cubre el footer fijo (56px) + home indicator de iPhone (34px) + margen */}
        <main
          id="main-content"
          className="max-w-[720px] mx-auto px-3 sm:px-4 pt-5 sm:pt-6 pb-28"
          aria-label="Carta de productos"
        >
          {Object.entries(grouped).length > 0 ? (
            Object.entries(grouped).map(([categoria, items]) => (
              <section
                key={categoria}
                aria-labelledby={`cat-${categoria}`}
                className="mb-8 sm:mb-10 animate-fade-in"
              >
                {/* Encabezado de categoría */}
                <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
                  <h2
                    id={`cat-${categoria}`}
                    className="font-serif text-[1.2rem] sm:text-[1.35rem] font-bold whitespace-nowrap"
                    style={{ color: "#e8c97a" }}
                  >
                    {categoria}
                  </h2>
                  <div
                    aria-hidden="true"
                    className="flex-1 h-px min-w-0"
                    style={{ background: "linear-gradient(90deg, rgba(201,158,76,0.25), transparent)" }}
                  />
                  <span className="text-[11px] font-sans whitespace-nowrap" style={{ color: "rgba(245,234,216,0.35)" }}>
                    {items.length} ítems
                  </span>
                </div>

                <ul className="flex flex-col gap-2.5 sm:gap-3" role="list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <MenuCard item={item} onClick={setSelectedItem} />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div aria-hidden="true" className="text-5xl mb-3">🔍</div>
              <p className="font-serif text-[1.2rem] sm:text-[1.3rem]" style={{ color: "rgba(245,234,216,0.55)" }}>
                Sin resultados
              </p>
              <p className="text-[13px] mt-1.5 font-sans" style={{ color: "rgba(245,234,216,0.35)" }}>
                Intenta con otro término
              </p>
            </div>
          )}
        </main>

        {/* ── Footer fijo ───────────────────────────────────────────────────── */}
        <footer
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 sm:px-6 sm:py-3.5"
          style={{
            background: "rgba(35,21,8,0.96)",
            backdropFilter: "blur(16px)",
            borderTop: "1px solid rgba(201,158,76,0.18)",
          }}
        >
          <address className="not-italic font-sans min-w-0 flex-1 pr-2" style={{ color: "rgba(245,234,216,0.35)" }}>
            {/* En móvil muestra solo el nombre; a partir de sm muestra la dirección completa */}
            <span className="font-bold text-[11px] sm:text-xs" style={{ color: "#c99e4c" }}>
              Pan y Ricuras Chipre
            </span>
            <span className="hidden sm:inline text-xs"> · Carrera 23 #71‑45, Manizales</span>
          </address>

          <a
            href="/admin/login"
            aria-label="Acceso administrador"
            className="text-xs flex-shrink-0"
            style={{ color: "rgba(245,234,216,0.35)", textDecoration: "none" }}
          >
            🔑
          </a>
        </footer>
      </div>

      <ItemModal item={selectedItem} onClose={handleCloseModal} />
    </>
  );
}
