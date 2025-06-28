import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  define: {
    // Make environment variables available to the client
    'process.env': {}
  },
  server: {
    // Development server configuration
    port: 3000,
    host: true,
    // Enable CORS for development
    cors: true
  },
  build: {
    // Production build configuration
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          utils: ['axios', 'date-fns', 'dayjs']
        }
      }
    }
  }
})
