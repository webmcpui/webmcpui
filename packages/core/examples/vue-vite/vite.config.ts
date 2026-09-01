import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat all <wmcp-*> tags as native custom elements so Vue doesn't
          // try to resolve them as Vue components.
          isCustomElement: (tag) => tag.startsWith('wmcp-'),
        },
      },
    }),
  ],
})
