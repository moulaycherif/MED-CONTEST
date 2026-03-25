import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      react: "/node_modules/react",
      "react-dom": "/node_modules/react-dom",
    },
  },
});