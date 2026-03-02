import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Needed for Docker, but will be mapped to localhost
    strictPort: true,
    headers: {
      // Allow Google OAuth popup to postMessage back to the parent window.
      // "same-origin" (the browser default when COOP is set) breaks this.
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["lucide-react", "react-hot-toast"],
          query: ["@tanstack/react-query"],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
});
