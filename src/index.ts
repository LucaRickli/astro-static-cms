import { spawn } from "node:child_process";

import type { AstroIntegration, AstroUserConfig } from "astro";
import type { Config, BaseField, UnknownField } from "@staticcms/core";
import type { Plugin } from "vite";

const virtualModuleId = "virtual:static-cms";
const resolvedVirtualModuleId = "\0" + virtualModuleId;

const applyDefaults = (config: Config): Config => ({
  media_folder: "public",
  public_folder: "/",
  ...config,
});

interface StaticCmsOptions<EF extends BaseField = UnknownField> {
  adminPath?: string;
  config: Config<EF>;
}

export const StaticCms = ({
  adminPath = "/admin",
  config: cmsConfig,
}: StaticCmsOptions): AstroIntegration => {
  let proxy: ReturnType<typeof spawn>;

  return {
    name: "astro-static-cms",
    hooks: {
      "astro:config:setup": ({
        config,
        command,
        injectRoute,
        updateConfig,
      }) => {
        const site = config["site"] || process.env.URL;

        cmsConfig.local_backend = cmsConfig.local_backend ?? command === "dev";
        cmsConfig.site_url = cmsConfig.site_url || site;

        updateConfig({
          site,
          vite: {
            plugins: [
              ...(config["vite"].plugins || []),
              StaticCmsPlugin(applyDefaults(cmsConfig)),
            ],
          },
        } as AstroUserConfig);

        injectRoute({
          pattern: adminPath,
          entryPoint: "../admin.astro",
        });
      },

      "astro:server:start": () => {
        proxy = spawn("npx", ["@staticcms/proxy-server"], {
          stdio: "inherit",
          // Run in shell on Windows to make sure the npm package can be found.
          shell: process.platform === "win32",
        });
        process.on("exit", () => proxy.kill());
      },

      "astro:server:done": () => {
        proxy.kill();
      },
    },
  };
};

/**
 * Virtual module to provide cms configuration.
 * @see {@link https://vitejs.dev/guide/api-plugin.html#virtual-modules-convention}
 */
export const StaticCmsPlugin = (config: Config): Plugin => ({
  name: "vite-static-cms-plugin",

  resolveId(id) {
    if (id === virtualModuleId) {
      return resolvedVirtualModuleId;
    }
  },

  load(id) {
    if (id === resolvedVirtualModuleId) {
      return `export default JSON.parse('${JSON.stringify(config)}');`;
    }
  },
});
