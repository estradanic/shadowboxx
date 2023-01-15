import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createHtmlPlugin } from "vite-plugin-html";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";

const manifest = {
  short_name: "Shadowboxx",
  name: "Collaborative Photo Albums",
  start_url: "/",
  display: "standalone",
  theme_color: "#ffffff",
  background_color: "#1B71B5",
  icons: [
    {
      src: "/icon-512x512.png",
      type: "image/png",
      sizes: "512x512",
      purpose: "any maskable",
    },
  ],
  share_target: {
    action: "/share_target",
    method: "POST",
    enctype: "multipart/form-data",
    params: {
      files: [
        {
          name: "media[]",
          accept: ["image/*"],
        },
      ],
    },
  },
};

export default defineConfig(({ mode }) => ({
  publicDir: "public",
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        manualChunks: {
          material_core: ["@material-ui/core"],
          parse: ["parse"],
        },
      },
    },
  },
  plugins: [
    checker({ typescript: true }),
    react({
      include: "**/*.{tsx}",
    }),
    createHtmlPlugin({
      inject: {
        data: {
          preconnectBack4App: `<link rel="preconnect" href="${
            mode === "production"
              ? "http://shadowboxx.b4a.io"
              : "http://shadowboxxdevtest.b4a.io"
          }" />`,
          injectVariables: `
            <script>
              window.__env__ = {
                PARSE_APPLICATION_ID: "${
                  mode === "production"
                    ? "aX17fiOL3N1Lklz83UnWMP6oympHLszezxXAXokH"
                    : "GkKaaxNRxTc1XONlpCizJtzVIzkWYI6ZLxrLylT4"
                }",
                PARSE_JAVASCRIPT_KEY: "${
                  mode === "production"
                    ? "otMMK0SVH7LEIL1TbqlIbemXf0jpfEurJ9FQ7gri"
                    : "vX8PThMi1vKelVwPkCRgkoRXDpBB5oDUeMO9PrZ2"
                }",
                PARSE_HOST_URL: "${
                  mode === "production"
                    ? "http://shadowboxx.b4a.io"
                    : "http://shadowboxxdevtest.b4a.io"
                }",
              };
            </script>
          `.replace(/\s/g, ""),
        },
      },
    }),
    VitePWA({
      manifest,
      strategies: "injectManifest",
      srcDir: "serviceWorker",
      filename: "serviceWorker.ts",
      registerType: "autoUpdate",
      scope: "/",
    }),
  ],
}));
