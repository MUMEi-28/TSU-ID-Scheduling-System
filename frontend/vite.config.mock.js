import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_USE_MOCK_API': '"true"'
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist-mock',
    sourcemap: true
  }
}) 