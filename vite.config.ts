import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/test_pd_client/',
  plugins: [react()],
  build: {
    minify: false,
  },
}) 