import type { Metadata } from "next";
import { Cormorant_Garamond, Syne } from "next/font/google";
import "./globals.css";

// ── Fuentes ───────────────────────────────────────────────────────────────────
// next/font/google descarga las fuentes en BUILD TIME y las sirve desde tu
// propio dominio. En runtime NO hay ningún request a fonts.googleapis.com.
// Beneficios:
//   • Privacidad: Google no recibe las IPs de tus visitantes
//   • Performance: sin round-trip externo al cargar la página
//   • CSP: font-src 'self' es suficiente (incluimos gstatic por los hints del build)

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// ── Metadata global ───────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://panyricuraschipre.com"
  ),
  title: {
    default: "Pan y Ricuras Chipre | Panadería y Repostería en Manizales",
    template: "%s | Pan y Ricuras Chipre",
  },
  description:
    "Carta digital de Pan y Ricuras en el barrio Chipre, Manizales. Pan artesanal, repostería, desayunos, almuerzos y bebidas. Carrera 23 #71-45.",
  robots: {
    index: true,
    follow: true,
  },
};

// ── Layout raíz ───────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${syne.variable}`}>
      <body className="bg-[#1a0f07] text-[#f5ead8] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
