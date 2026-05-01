import react from '@vitejs/plugin-react';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

const projectRoot = process.cwd();
const scannerPath = path.join(projectRoot, 'scanner.py');
const scannerOutputPath = path.join(projectRoot, 'public', 'projects.json');

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
};

const readBody = (req) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1024 * 64) {
      reject(new Error('Request body too large.'));
      req.destroy();
    }
  });
  req.on('end', () => resolve(body));
  req.on('error', reject);
});

const localScannerPlugin = () => ({
  name: 'aperture-local-scanner',
  configureServer(server) {
    server.middlewares.use('/api/rescan', async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Use POST to run the local scanner.' });
        return;
      }

      if (!existsSync(scannerPath)) {
        sendJson(res, 500, { error: 'scanner.py was not found.' });
        return;
      }

      let root = projectRoot;
      try {
        const body = await readBody(req);
        const parsed = body ? JSON.parse(body) : {};
        if (typeof parsed.root === 'string' && parsed.root.trim()) {
          root = parsed.root;
        }
      } catch (error) {
        sendJson(res, 400, { error: error.message || 'Invalid JSON request body.' });
        return;
      }

      const scanner = spawn('python3', [scannerPath, '--root', root, '--output', scannerOutputPath], {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stderr = '';
      let responded = false;
      scanner.stderr.on('data', (chunk) => {
        stderr += chunk;
      });

      scanner.on('error', (error) => {
        responded = true;
        sendJson(res, 500, { error: error.message });
      });

      scanner.on('close', (code) => {
        if (responded) return;
        if (code !== 0) {
          sendJson(res, 500, { error: stderr || `scanner.py exited with code ${code}.` });
          return;
        }

        try {
          sendJson(res, 200, JSON.parse(readFileSync(scannerOutputPath, 'utf8')));
        } catch (error) {
          sendJson(res, 500, { error: error.message || 'Scanner output could not be read.' });
        }
      });
    });
  },
});

export default defineConfig({
  plugins: [react(), localScannerPlugin()],
});
