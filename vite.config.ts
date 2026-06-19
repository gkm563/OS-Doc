import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'manage-data-dir',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/data/')) {
            const cleanUrl = req.url.split('?')[0];
            const filePath = path.join(__dirname, decodeURIComponent(cleanUrl));
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
              } else if (filePath.endsWith('.md')) {
                res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
              }
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });

        // Local development write-to-filesystem shim
        server.middlewares.use((req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/write-local') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const { filePath, content } = JSON.parse(body);
                const fullPath = path.resolve(__dirname, filePath);
                if (!fullPath.startsWith(__dirname)) {
                  res.statusCode = 403;
                  res.end(JSON.stringify({ error: 'Access Denied: Path outside workspace' }));
                  return;
                }
                fs.mkdirSync(path.dirname(fullPath), { recursive: true });
                fs.writeFileSync(fullPath, content, 'utf-8');
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              } catch (e: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message || 'Write Failed' }));
              }
            });
            return;
          }
          next();
        });
      },
      closeBundle() {
        const srcDir = path.resolve(__dirname, 'data');
        const destDir = path.resolve(__dirname, 'dist/data');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          fs.cpSync(srcDir, destDir, { recursive: true });
          console.log('✓ Copied data/ to dist/data/');
        }
      }
    }
  ],
})

