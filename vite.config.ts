import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@clinician': path.resolve(__dirname, './clinician'),
      '@admin': path.resolve(__dirname, './admin'),
      '@auth': path.resolve(__dirname, './auth'),
      '@website': path.resolve(__dirname, './website'),
    },
  },
  server: {
    port: 5176,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react/") || id.includes("node_modules/react-router")) {
            return "react-vendor"
          }
          if (id.includes("node_modules/@supabase")) {
            return "supabase"
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion"
          }
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform") || id.includes("node_modules/zod")) {
            return "forms"
          }
        },
      },
    },
  },
})