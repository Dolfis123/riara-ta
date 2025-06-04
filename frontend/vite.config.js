import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['skydance.life', 'www.skydance.life', 'localhost', '127.0.0.1']
  }
})
