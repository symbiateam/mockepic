import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mockepic/',
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})