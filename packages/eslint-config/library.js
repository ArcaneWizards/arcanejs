const { resolve } = require("node:path");
const { SHARED_RULES } = require("./shared-rules");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["eslint:recommended", 'plugin:@typescript-eslint/recommended', "prettier", "turbo"],
  plugins: ["jest"],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    "jest/globals": true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
    "coverage/",
  ],
  "rules": SHARED_RULES,
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
    {
      files: ["*.test.js?(x)", "*.test.ts?(x)"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      }
    },
  ],
};
