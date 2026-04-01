import { melPlugin } from '@manifesto-ai/compiler/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    melPlugin(),
    vue(),
  ],
})
