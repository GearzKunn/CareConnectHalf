// @ts-ignore: Ignore missing dev dependency types in some inspection environments
import { defineConfig } from "vite";
// @ts-ignore: Ignore missing dev dependency types in some inspection environments
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080,
    // --- ADD THE PROXY SECTION BELOW ---
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Matches your API_BASE_URL in api.ts
        changeOrigin: true,
        secure: false,
      },
    },
    // --- END OF PROXY SECTION ---
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));