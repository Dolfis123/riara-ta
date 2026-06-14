import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['inventaris.pengadilannegerimanokwari.cloud','localhost:5000/api', '127.0.0.1']
  }
})
