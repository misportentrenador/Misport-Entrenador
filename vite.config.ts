import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    // vendor-pdf (jspdf, Sprint 19) supera el límite por defecto por sus
    // fuentes embebidas, pero es un chunk de carga perezosa — solo se
    // descarga al generar una factura, nunca en el arranque ni en el
    // resto de la navegación.
    chunkSizeWarningLimit: 700,
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
          // jspdf (y lo que arrastra) solo se importa dinámicamente
          // (Sprint 19, generación de factura) — chunk propio para que ese
          // peso no viaje en el paquete inicial ni se mezcle con módulos
          // que sí se cargan siempre (p. ej. @google/genai, usado por
          // BookingWizard).
          if (id.includes('jspdf') || id.includes('fflate') || id.includes('fast-png') || id.includes('canvg') || id.includes('dompurify') || id.includes('html2canvas')) return 'vendor-pdf'
          return 'vendor'
        }
      }
    }
  }
})