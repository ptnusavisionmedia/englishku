const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettier,
  {
    // Data fetching on mount/param change is intentional in these hooks and screens.
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  globalIgnores(['dist/*', '.expo/*', 'node_modules/*', 'supabase/*', 'scripts/*']),
]);
