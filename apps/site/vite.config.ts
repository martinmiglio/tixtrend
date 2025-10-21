import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["@tixtrend/core"],
  },
  server: {
    port: 3000,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        routesDirectory: "app",
      },
    }),
    nitro({
      config: {
        preset: "aws-lambda",
        externals: {
          inline: ["@aws-sdk/**", "mnemonist", "obliterator", "@tixtrend/core"],
        },
      },
    }),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
