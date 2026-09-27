import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/jenjos-expense/',
  build: {
    chunkSizeWarningLimit: 1500,
  },
})
