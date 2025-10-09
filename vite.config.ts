import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request that starts with /api will be proxied to the backend
      "/api": {
        target: "http://localhost:4242",
        changeOrigin: true,
        // strip the /api prefix when forwarding
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
