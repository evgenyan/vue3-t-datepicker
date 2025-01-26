import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    lib: {
      // Указываем точку входа
      entry: 'src/index.ts',
      // Название нашей библиотеки
      name: 'TDatepicker',
      // Форматы, которые хотим собрать
      formats: ['es', 'umd'],
      // Выходные файлы
      fileName: (format) => `t-datepicker.${format}.js`
    },
    rollupOptions: {
      // Внешние зависимости (то, что не нужно бандлить внутрь)
      external: ['vue'],
      output: {
        // Глобальная переменная, если формат umd
        globals: {
          vue: 'Vue'
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
