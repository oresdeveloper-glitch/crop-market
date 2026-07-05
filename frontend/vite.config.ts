import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "bity";

  return {
    plugins: [react()],
    base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : "/",
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:5000",
          changeOrigin: true,
        },
        "/socket.io": {
          target: env.VITE_API_PROXY_TARGET || "http://localhost:5000",
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
