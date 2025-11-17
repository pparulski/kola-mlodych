
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Note: Critters is only needed in production build; we'll dynamically import it inside the config to avoid dev dependency errors.

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === 'production') {
    const beasties = (await import('beasties')).default;
    plugins.push(
      beasties({
        // Only log errors
        logger: 1,
        // Resolve CSS/asset paths relative to project root
        path: '.',
        // Inline critical CSS. 0 means always inline what's critical for the page
        inlineThreshold: 0,
        // Remove inlined CSS from external sheets to avoid duplication
        pruneSource: true,
        // Merge multiple stylesheets into one when possible
        merge: true,
      })
    );
  }

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
