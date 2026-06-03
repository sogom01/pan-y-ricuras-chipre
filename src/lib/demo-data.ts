// Datos de demostración — usados cuando Supabase no está configurado.
// Espeja INIT_MENU del prototipo original (pan-y-ricuras-v2.jsx).
// Cuando NEXT_PUBLIC_SUPABASE_URL esté lleno, este archivo no se usa.

import type { MenuItem } from "@/lib/domain/menu-item";

const NOW = new Date().toISOString();

export const DEMO_ITEMS: MenuItem[] = [
  { id:"1", cat:"🥐 Panadería",        nombre:"Pan de Achira",             descripcion:"Pan tradicional de almidón de achira, crujiente por fuera y suave por dentro.",   precio:3500,  emoji:"🥐", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"2", cat:"🥐 Panadería",        nombre:"Croissant de Mantequilla",   descripcion:"Hojaldrado artesanal con mantequilla francesa. Recién horneado cada mañana.",     precio:6500,  emoji:"🥐", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"3", cat:"🥐 Panadería",        nombre:"Pan de Queso",               descripcion:"Suave y esponjoso con queso doble crema derretido en cada bocado.",               precio:4000,  emoji:"🧀", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"4", cat:"🥐 Panadería",        nombre:"Almojábana",                 descripcion:"Clásica almojábana bogotana, esponjosa con sabor auténtico a queso campesino.",   precio:3800,  emoji:"🫓", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"5", cat:"🍰 Repostería",       nombre:"Torta de Zanahoria",         descripcion:"Húmeda y especiada, cubierta con frosting de queso crema y nueces tostadas.",     precio:9500,  emoji:"🎂", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"6", cat:"🍰 Repostería",       nombre:"Brownie de Chocolate",       descripcion:"Intenso y fudgy con chips de chocolate belga. Servido tibio.",                    precio:8000,  emoji:"🍫", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"7", cat:"🍰 Repostería",       nombre:"Cheesecake de Frutos Rojos", descripcion:"Base de galleta, relleno cremoso y coulis de frutos rojos frescos.",             precio:11000, emoji:"🍰", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"8", cat:"🍰 Repostería",       nombre:"Éclair de Vainilla",         descripcion:"Masa choux rellena de crema pastelera de vainilla Bourbon y glaseado dorado.",   precio:7500,  emoji:"🍮", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"9", cat:"🍰 Repostería",       nombre:"Milhojas de Arequipe",       descripcion:"Capas crujientes de hojaldre con arequipe casero y azúcar pulverizada.",          precio:8500,  emoji:"🍰", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"10", cat:"☕ Bebidas Calientes", nombre:"Café Espresso",             descripcion:"Shot doble de café de origen colombiano. Notas a caramelo y frutos secos.",       precio:4500,  emoji:"☕", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"11", cat:"☕ Bebidas Calientes", nombre:"Cappuccino",                descripcion:"Espresso con leche vaporizada y espuma sedosa. Arte latte incluido.",             precio:7000,  emoji:"☕", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"12", cat:"☕ Bebidas Calientes", nombre:"Chocolate Caliente",        descripcion:"Chocolate de mesa en leche entera con canela y una pizca de clavo.",             precio:6500,  emoji:"🍵", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"13", cat:"☕ Bebidas Calientes", nombre:"Té Chai Latte",             descripcion:"Mezcla de especias orientales con leche vaporizada. Cálido y aromático.",        precio:6000,  emoji:"🍵", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"14", cat:"☕ Bebidas Calientes", nombre:"Café de Olla",              descripcion:"Preparación tradicional con panela, canela y clavo de olor. Auténtico sabor.",   precio:5000,  emoji:"☕", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"15", cat:"🧋 Bebidas Frías",    nombre:"Frappé de Caramelo",        descripcion:"Café frío batido con caramelo, crema chantilly y sirope artesanal.",              precio:9000,  emoji:"🧋", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"16", cat:"🧋 Bebidas Frías",    nombre:"Limonada de Coco",          descripcion:"Limonada natural con crema de coco y menta. Refrescante y tropical.",            precio:8000,  emoji:"🥤", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"17", cat:"🧋 Bebidas Frías",    nombre:"Smoothie Tropical",         descripcion:"Mango, piña, maracuyá y banano con jugo de naranja y jengibre.",                 precio:9500,  emoji:"🥭", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"18", cat:"🧋 Bebidas Frías",    nombre:"Cold Brew",                  descripcion:"Café extraído en frío durante 18 horas. Suave, concentrado y sin amargura.",     precio:8500,  emoji:"🧋", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"19", cat:"🍳 Desayunos",        nombre:"Desayuno Campesino",         descripcion:"Calentado, huevo al gusto, arepa, hogao y chocolate caliente.",                  precio:18000, emoji:"🍳", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"20", cat:"🍳 Desayunos",        nombre:"Tostadas con Aguacate",      descripcion:"Pan artesanal tostado con aguacate, tomate cherry, limón y semillas de sésamo.", precio:14000, emoji:"🥑", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"21", cat:"🍳 Desayunos",        nombre:"Bowl de Granola",            descripcion:"Granola artesanal con yogurt griego, frutas de temporada y miel de abejas.",     precio:13000, emoji:"🥣", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"22", cat:"🍳 Desayunos",        nombre:"Huevos Benedictinos",        descripcion:"Muffin inglés, jamón serrano, huevo pochado y salsa holandesa artesanal.",       precio:19000, emoji:"🍳", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"23", cat:"🥪 Almuerzos",        nombre:"Sándwich Club",              descripcion:"Pollo a la plancha, tocineta, lechuga, tomate y mayonesa en pan brioche.",       precio:16000, emoji:"🥪", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"24", cat:"🥪 Almuerzos",        nombre:"Wrap de Pollo BBQ",          descripcion:"Tortilla de harina, pollo BBQ, cebolla caramelizada, queso cheddar y coleslaw.", precio:15000, emoji:"🌯", destacado:true,  disponible:true,  created_at:NOW, updated_at:NOW },
  { id:"25", cat:"🥪 Almuerzos",        nombre:"Quiche Lorraine",            descripcion:"Masa quebrada rellena de tocineta, queso gruyere y crema. Servida tibia.",      precio:13500, emoji:"🥧", destacado:false, disponible:true,  created_at:NOW, updated_at:NOW },
];
