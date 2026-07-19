const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  eslintPluginPrettierRecommended,
];
