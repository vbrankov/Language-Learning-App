import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dbDir = resolve(__dirname, '../../Language-Learning-DB')
const db2Dir = resolve(__dirname, '../../english-serbian-db')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-local-db',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/db/')) return next();
          const filename = req.url.slice(4);
          try {
            const content = readFileSync(resolve(dbDir, filename), 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(content);
          } catch {
            next();
          }
        });
        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/db2/')) return next();
          const filename = req.url.slice(5);
          try {
            const content = readFileSync(resolve(db2Dir, filename), 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(content);
          } catch {
            next();
          }
        });
      },
    },
  ],
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