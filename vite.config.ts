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
import fs from "fs";
import dotenv from "dotenv";
import wbn from "rollup-plugin-webbundle";
import * as wbnSign from "wbn-sign";

dotenv.config();

const plugins : Array<PluginOption> = [];

if (process.env.BUILD_TYPE === "release") {
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
  plugins.push(copyBundleToReleases());
  plugins.push(setWebManifestVersion());
  plugins.push(generateUpdateManifest());
}

plugins.push(outputReleaseBundles());

const PORT = Number(process.env.PORT ?? 5193);

export default defineConfig({
  plugins,
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "public"),
  server: {
    port: PORT,
    strictPort: true,
  },
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true, // Stops warning that `outDir` is outside `root`.
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/index.html"),
      },
    },
  },
});

// Sets the version in the web manifest file.
//
// This is a vite plugin. See https://vite.dev/guide/api-plugin.
function setWebManifestVersion() {
  const setVersion = (version: string) => {
    const WEBMANIFEST = "public/.well-known/manifest.webmanifest";
    const manifest = JSON.parse(fs.readFileSync(WEBMANIFEST, "utf-8"));
    if (manifest.version === version) return;
    manifest.version = version;
    fs.writeFileSync(WEBMANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  };
  return {
    name: "iwa:set-manifest-version",
    apply: "build",
    buildStart: () => {
      if (!fs.existsSync("releases")) return setVersion("1.0.0");

      const bundles = fs.readdirSync("releases").filter((f) => f.endsWith(".swbn"));
      const versions = bundles.map((f) => f.replace("iwa_", "").replace(".swbn", ""));
      const [[major]] = versions
        .map((v) => v.split(".").map((k) => parseInt(k)))
        .sort((a, b) => b[0] - a[0]);
      setVersion(`${major + 1}.0.0`);
    },
    closeBundle: () => setVersion("0.0.0"),
  } satisfies PluginOption;
}

// Copies ./dist/iwa.swbn to ./releases/iwa_<version>.swbn.
function copyBundleToReleases() {
  return {
    name: "iwa:copy-bundle-to-release",
    apply: "build",
    closeBundle: () => {
      if (!fs.existsSync("releases")) fs.mkdirSync("releases");

      const WEBMANIFEST = "public/.well-known/manifest.webmanifest";
      const manifest = JSON.parse(fs.readFileSync(WEBMANIFEST, "utf-8"));
      fs.copyFileSync("dist/iwa.swbn", `releases/iwa_${manifest.version}.swbn`);
    },
  } satisfies PluginOption;
}

// Generates the public/releases/update_manifest.json file.
function generateUpdateManifest() {
  return {
    name: "iwa:generate-update-manifest-json",
    apply: "build",
    closeBundle: () => {
      const firebase_json = JSON.parse(fs.readFileSync("firebase.json", "utf-8"));
      const bundles = fs.readdirSync("releases").filter((f) => f.endsWith(".swbn"));
      const versions = bundles.map((file) => {
        return {
          version: file.replace("iwa_", "").replace(".swbn", ""),
          src: `https://${firebase_json.hosting.site}.web.app/releases/${file}`,
        };
      });
      fs.writeFileSync(
        "releases/update_manifest.json",
        JSON.stringify({ versions }, null, 2) + "\n",
      );
    },
  } satisfies PluginOption;
}

// Copies ./releases do ./dist/releases.
function outputReleaseBundles() {
  return {
    name: "iwa:output-release-bundles",
    apply: "build",
    closeBundle: () => {
      if (fs.existsSync("releases"))
        fs.cpSync("releases", "dist/releases", { recursive:true });
    },
  } satisfies PluginOption;
}
