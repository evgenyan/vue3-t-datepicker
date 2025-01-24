import vueTsEslintConfig from '@vue/eslint-config-typescript'
// import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import stylistic from '@stylistic/eslint-plugin'
import pluginVue from 'eslint-plugin-vue';

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
  // ...pluginVue.configs['flat/essential'],
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  // skipFormatting,
]
