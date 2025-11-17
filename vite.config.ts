
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Note: Critters is only needed in production build; we'll dynamically import it inside the config to avoid dev dependency errors.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [react()];
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
