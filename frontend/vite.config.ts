import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Language-Learning-App/',
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 5173,        // Default Vite port
    https: {
      key: readFileSync(resolve(__dirname, 'localhost-key.pem')),
      cert: readFileSync(resolve(__dirname, 'localhost.pem')),
    }
  }
})