import * as esbuild from "esbuild";
import * as glob from "glob";

const entryPoints = glob.sync("src/**/*.ts", { ignore: "src/**/*.d.ts" });

esbuild
  .build({
    entryPoints: entryPoints,
    bundle: true,
    outdir: "build",
    format: "esm",
    platform: "node",
    target: "es2022",
    tsconfig: "tsconfig.json",
    external: ["o1js"],
    sourcemap: true,
    loader: {
      ".ts": "ts",
    },
  })
  .catch(() => process.exit(1));
