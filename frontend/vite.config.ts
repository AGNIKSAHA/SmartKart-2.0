import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Needed for Docker, but will be mapped to localhost
    strictPort: true,
    headers: {
      // For the implicit access_token flow (useGoogleLogin hook), COOP must be
      // "unsafe-none" so the Google GIS library can correctly detect popup closure
      // via window.closed. "same-origin-allow-popups" was needed for the old
      // <GoogleLogin> credential/FedCM flow, but causes an infinite setTimeout
      // polling loop with the popup-based implicit flow.
      "Cross-Origin-Opener-Policy": "unsafe-none",
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
