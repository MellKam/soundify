import replace from "@rollup/plugin-replace";
import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

const plugins = [
  nodeResolve({
    extensions: [".js", ".ts"],
  }),
  babel({
    extensions: [".js", ".ts"],
    exclude: "node_modules/**",
    babelrc: false,
    babelHelpers: "bundled",
    presets: ["@babel/preset-typescript"],
  }),
];

const replaceEnv = (opts) =>
  replace({
    '"_IS_DEV_"': opts.isDev,
    '"_IS_NODE_"': opts.isNode,
    preventAssignment: true,
    delimiters: ["", ""],
  });

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/browser-dev.js",
        format: "es",
      },
      {
        file: "dist/browser-dev.cjs",
        format: "cjs",
      },
    ],
    plugins: [
      replaceEnv({
        isDev: true,
        isNode: false,
      }),
    ].concat(plugins),
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/browser-prod.js",
        format: "es",
      },
      {
        file: "dist/browser-prod.cjs",
        format: "cjs",
      },
    ],
    plugins: [
      replaceEnv({
        isDev: false,
        isNode: false,
      }),
    ].concat(plugins),
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/server-dev.js",
        format: "es",
      },
      {
        file: "dist/server-dev.cjs",
        format: "cjs",
      },
    ],
    plugins: [
      replaceEnv({
        isDev: true,
        isNode: true,
      }),
    ].concat(plugins),
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/server-prod.js",
        format: "es",
      },
      {
        file: "dist/server-prod.cjs",
        format: "cjs",
      },
    ],
    plugins: [
      replaceEnv({
        isDev: false,
        isNode: true,
      }),
    ].concat(plugins),
  },
];
