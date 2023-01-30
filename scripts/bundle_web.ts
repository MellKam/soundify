import { bundle } from "https://deno.land/x/emit@0.14.0/mod.ts";
import { createCache } from "https://deno.land/x/deno_cache@0.4.1/mod.ts";

const cache = createCache();

const { code: bundledCode } = await bundle("./src/mod.ts", {
  load: (specifier: string) => {
    if (specifier.endsWith(".deno.ts")) {
      const baseLength = specifier.length - ".deno.ts".length;
      specifier = specifier.substring(0, baseLength) + ".web.ts";
    }
    return cache.load(specifier);
  },
  compilerOptions: {
    sourceMap: false,
    inlineSources: false,
    inlineSourceMap: false,
  },
});

await Deno.writeTextFile(
  "./dist/web.mjs",
  bundledCode.replace(/\/\/# sourceMappingURL=.*\n/, ""),
);
await Deno.writeTextFile(
  "./dist/web.d.ts",
  'export * from "./mod.js";\n',
);

console.log("Done.");
