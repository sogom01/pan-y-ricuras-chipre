-- ============================================================
-- MIGRACIÓN 003 — Seed inicial: 26 productos del menú
-- Proyecto: Pan y Ricuras Chipre
-- Fuente: INIT_MENU en pan-y-ricuras-v2.jsx (prototipo)
-- ============================================================
-- Nota: Los UUIDs NO se especifican (gen_random_uuid() los genera).
-- Nota: Los precios son enteros COP sin decimales.
-- Nota: Se usa INSERT ... ON CONFLICT DO NOTHING para idempotencia
--       — puedes ejecutar este seed múltiples veces sin duplicar.
--       La constraint UNIQUE en (nombre, cat) garantiza idempotencia.
-- ============================================================

-- Constraint de unicidad para idempotencia del seed
-- (nombre + cat identifica un producto de forma natural)
ALTER TABLE public.menu_items
  ADD CONSTRAINT uq_menu_nombre_cat UNIQUE (nombre, cat);

INSERT INTO public.menu_items (nombre, descripcion, precio, emoji, cat, destacado, disponible)
VALUES

  -- ── 🥐 Panadería ─────────────────────────────────────────
  (
    'Pan de Achira',
    'Pan tradicional de almidón de achira, crujiente por fuera y suave por dentro.',
    3500, '🥐', '🥐 Panadería', true, true
  ),
  (
    'Croissant de Mantequilla',
    'Hojaldrado artesanal con mantequilla francesa. Recién horneado cada mañana.',
    6500, '🥐', '🥐 Panadería', false, true
  ),
  (
    'Pan de Queso',
    'Suave y esponjoso con queso doble crema derretido en cada bocado.',
    4000, '🧀', '🥐 Panadería', true, true
  ),
  (
    'Almojábana',
    'Clásica almojábana bogotana, esponjosa con sabor auténtico a queso campesino.',
    3800, '🫓', '🥐 Panadería', false, true
  ),
  (
    'Mogolla Integral',
    'Pan integral con semillas de girasol y linaza. Rica en fibra y nutritiva.',
    4200, '🌾', '🥐 Panadería', false, false  -- agotado en el prototipo
  ),

  -- ── 🍰 Repostería ─────────────────────────────────────────
  (
    'Torta de Zanahoria',
    'Húmeda y especiada, cubierta con frosting de queso crema y nueces tostadas.',
    9500, '🎂', '🍰 Repostería', true, true
  ),
  (
    'Brownie de Chocolate',
    'Intenso y fudgy con chips de chocolate belga. Servido tibio.',
    8000, '🍫', '🍰 Repostería', false, true
  ),
  (
    'Cheesecake de Frutos Rojos',
    'Base de galleta, relleno cremoso y coulis de frutos rojos frescos.',
    11000, '🍰', '🍰 Repostería', true, true
  ),
  (
    'Éclair de Vainilla',
    'Masa choux rellena de crema pastelera de vainilla Bourbon y glaseado dorado.',
    7500, '🍮', '🍰 Repostería', false, true
  ),
  (
    'Milhojas de Arequipe',
    'Capas crujientes de hojaldre con arequipe casero y azúcar pulverizada.',
    8500, '🍰', '🍰 Repostería', false, true
  ),

  -- ── ☕ Bebidas Calientes ────────────────────────────────────
  (
    'Café Espresso',
    'Shot doble de café de origen colombiano. Notas a caramelo y frutos secos.',
    4500, '☕', '☕ Bebidas Calientes', true, true
  ),
  (
    'Cappuccino',
    'Espresso con leche vaporizada y espuma sedosa. Arte latte incluido.',
    7000, '☕', '☕ Bebidas Calientes', false, true
  ),
  (
    'Chocolate Caliente',
    'Chocolate de mesa en leche entera con canela y una pizca de clavo.',
    6500, '🍵', '☕ Bebidas Calientes', true, true
  ),
  (
    'Té Chai Latte',
    'Mezcla de especias orientales con leche vaporizada. Cálido y aromático.',
    6000, '🍵', '☕ Bebidas Calientes', false, true
  ),
  (
    'Café de Olla',
    'Preparación tradicional con panela, canela y clavo de olor. Auténtico sabor.',
    5000, '☕', '☕ Bebidas Calientes', false, true
  ),

  -- ── 🧋 Bebidas Frías ────────────────────────────────────────
  (
    'Frappé de Caramelo',
    'Café frío batido con caramelo, crema chantilly y sirope artesanal.',
    9000, '🧋', '🧋 Bebidas Frías', true, true
  ),
  (
    'Limonada de Coco',
    'Limonada natural con crema de coco y menta. Refrescante y tropical.',
    8000, '🥤', '🧋 Bebidas Frías', false, true
  ),
  (
    'Smoothie Tropical',
    'Mango, piña, maracuyá y banano con jugo de naranja y jengibre.',
    9500, '🥭', '🧋 Bebidas Frías', false, true
  ),
  (
    'Cold Brew',
    'Café extraído en frío durante 18 horas. Suave, concentrado y sin amargura.',
    8500, '🧋', '🧋 Bebidas Frías', true, true
  ),

  -- ── 🍳 Desayunos ────────────────────────────────────────────
  (
    'Desayuno Campesino',
    'Calentado, huevo al gusto, arepa, hogao y chocolate caliente.',
    18000, '🍳', '🍳 Desayunos', true, true
  ),
  (
    'Tostadas con Aguacate',
    'Pan artesanal tostado con aguacate, tomate cherry, limón y semillas de sésamo.',
    14000, '🥑', '🍳 Desayunos', false, true
  ),
  (
    'Bowl de Granola',
    'Granola artesanal con yogurt griego, frutas de temporada y miel de abejas.',
    13000, '🥣', '🍳 Desayunos', false, true
  ),
  (
    'Huevos Benedictinos',
    'Muffin inglés, jamón serrano, huevo pochado y salsa holandesa artesanal.',
    19000, '🍳', '🍳 Desayunos', true, true
  ),

  -- ── 🥪 Almuerzos ────────────────────────────────────────────
  (
    'Sándwich Club',
    'Pollo a la plancha, tocineta, lechuga, tomate y mayonesa en pan brioche.',
    16000, '🥪', '🥪 Almuerzos', false, true
  ),
  (
    'Wrap de Pollo BBQ',
    'Tortilla de harina, pollo BBQ, cebolla caramelizada, queso cheddar y coleslaw.',
    15000, '🌯', '🥪 Almuerzos', true, true
  ),
  (
    'Quiche Lorraine',
    'Masa quebrada rellena de tocineta, queso gruyere y crema. Servida tibia.',
    13500, '🥧', '🥪 Almuerzos', false, true
  )

ON CONFLICT (nombre, cat) DO NOTHING;

-- ── Verificación post-seed ───────────────────────────────────
-- Ejecutar en SQL editor de Supabase para confirmar:
--
-- SELECT cat, count(*) as total,
--        count(*) FILTER (WHERE disponible) as disponibles,
--        count(*) FILTER (WHERE destacado)  as destacados
-- FROM public.menu_items
-- GROUP BY cat
-- ORDER BY cat;
--
-- Resultado esperado:
-- ☕ Bebidas Calientes | 5 | 5 | 2
-- 🍰 Repostería       | 5 | 5 | 2
-- 🍳 Desayunos        | 4 | 4 | 2
-- 🥐 Panadería        | 5 | 4 | 1  ← Mogolla Integral agotada
-- 🥪 Almuerzos        | 3 | 3 | 1
-- 🧋 Bebidas Frías    | 4 | 4 | 2
-- TOTAL               | 26
