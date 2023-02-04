import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

import postcssImport from 'postcss-import'
import postcssNestedVars from 'postcss-nested-vars'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [postcssImport, postcssNestedVars]
    }
  }
})
