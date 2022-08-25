import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {createHtmlPlugin} from "vite-plugin-html";
import variables from "./variables.json";

export default defineConfig(({command}) => ({
  build: {
    outDir: "build",
    manifest: true,
    target: "es5",
  },
  plugins: [
    react({
      include: "**/*.{tsx}",
    }),
    createHtmlPlugin({
      inject: {
        data: {
          injectVariables:`
            <script>
              globalThis.__env__ = {
                PARSE_APPLICATION_ID: "${command === "build" ? "aX17fiOL3N1Lklz83UnWMP6oympHLszezxXAXokH" : "GkKaaxNRxTc1XONlpCizJtzVIzkWYI6ZLxrLylT4"}",
                PARSE_JAVASCRIPT_KEY: "${command === "build" ? "otMMK0SVH7LEIL1TbqlIbemXf0jpfEurJ9FQ7gri" : "vX8PThMi1vKelVwPkCRgkoRXDpBB5oDUeMO9PrZ2"}",
                PARSE_HOST_URL: "${command === "build" ? "http://shadowboxx.b4a.io" : "http://shadowboxxdevtest.b4a.io"}",
                SERVICE_WORKER_VERSION_NUMBER: "${variables.version}",
              };
            </script>
          `.replace(/\s/g, ""),
        },
      },
    }),
  ],
}));
