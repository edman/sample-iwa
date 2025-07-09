/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { defineConfig, PluginOption } from "vite";

import { resolve } from "path";
import dotenv from "dotenv";
import wbn from "rollup-plugin-webbundle";
import * as wbnSign from "wbn-sign";

dotenv.config();

const plugins : Array<PluginOption> = [];

const should_build_bundle = process.env.BUILD_TYPE === "bundle";

if (should_build_bundle) {
  const keyBuffer = Buffer.from(process.env.SIGNING_KEY!, 'utf-8');
  const key = wbnSign.parsePemKey(keyBuffer);

  plugins.push({
    ...wbn({
      baseURL: new wbnSign.WebBundleId(key).serializeWithIsolatedWebAppOrigin(),
      static: { dir: "public" },
      output: "iwa.swbn",
      integrityBlockSign: {
        strategy: new wbnSign.NodeCryptoSigningStrategy(key),
      },
    }),
    enforce: "post",
  });
}

const PORT = Number(process.env.PORT ?? 5193);

export default defineConfig({
  plugins,
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "public"),
  server: {
    port: PORT,
    strictPort: true,
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: PORT,
    },
    watch: {
      ignored: ["**/.git", "**/.direnv", "**/node_modules"],
    },
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: !should_build_bundle,
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
      },
    },
  },
});