import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // Resolver el alias @/* que define Next.js en tsconfig.json
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Cobertura básica MVP-first (70% en la capa de datos)
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/supabase/**"],  // los clientes de Supabase no se testean en unit
      thresholds: {
        lines:     70,
        functions: 70,
        branches:  60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
