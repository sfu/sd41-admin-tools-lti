module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["unobtrusive", "plugin:react/recommended"],
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    "prefer-template": "warn",
    "react/display-name": "off",
  },
};
