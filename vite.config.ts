import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Separa las librerías de terceros del código propio — reduce el
        // bundle principal y permite que el navegador cachee las
        // dependencias por separado entre despliegues. Puramente de
        // empaquetado: no cambia qué código se ejecuta.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('lucide-react')) return 'vendor-icons'
          return 'vendor'
        }
      }
    }
  }
})