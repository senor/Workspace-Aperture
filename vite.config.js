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

const textBetween = (html, pattern) => {
  const match = html.match(pattern);
  return match?.[1]?.trim() || '';
};

const metaContent = (html, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, 'i'),
  ];
  return patterns.map((pattern) => textBetween(html, pattern)).find(Boolean) || '';
};

const linkHref = (html, relPattern) => {
  const patterns = [
    new RegExp(`<link[^>]+rel=["'][^"']*${relPattern}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${relPattern}[^"']*["'][^>]*>`, 'i'),
  ];
  return patterns.map((pattern) => textBetween(html, pattern)).find(Boolean) || '';
};

const checkFaviconIco = async (baseUrl) => {
  try {
    const faviconUrl = new URL('/favicon.ico', baseUrl).toString();
    const response = await fetch(faviconUrl, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
};

const analyzeLiveHtml = async (targetUrl, html, response) => {
  const title = textBetween(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = metaContent(html, 'description');
  const canonical = linkHref(html, 'canonical');
  const robots = metaContent(html, 'robots').toLowerCase();
  const favicon = linkHref(html, '(?:shortcut\\s+icon|icon|apple-touch-icon|mask-icon)');
  const hasFavicon = Boolean(favicon) || await checkFaviconIco(targetUrl);
  const ogTitle = metaContent(html, 'og:title');
  const ogDescription = metaContent(html, 'og:description');
  const ogImage = metaContent(html, 'og:image');
  const hasNoIndex = robots.includes('noindex');
  const finalUrl = response.url || targetUrl;

  return {
    url: targetUrl,
    finalUrl,
    status: response.status,
    checkedAt: new Date().toISOString(),
    checks: {
      favicon: {
        passed: hasFavicon,
        detail: hasFavicon
          ? 'Favicon or touch icon was detected.'
          : 'No favicon link was found, and /favicon.ico did not respond successfully.',
        evidence: favicon || (hasFavicon ? '/favicon.ico' : ''),
      },
      ogCard: {
        passed: Boolean(ogTitle && ogDescription && ogImage),
        detail: ogTitle && ogDescription && ogImage
          ? 'Open Graph title, description, and image are present.'
          : 'Open Graph title, description, or image is missing.',
        evidence: [ogTitle ? 'og:title' : '', ogDescription ? 'og:description' : '', ogImage ? 'og:image' : ''].filter(Boolean).join(', '),
      },
      seo: {
        passed: Boolean(title && description && canonical && !hasNoIndex),
        detail: title && description && canonical && !hasNoIndex
          ? 'Title, meta description, canonical URL, and indexability look present.'
          : 'Title, meta description, canonical URL, or indexability needs review.',
        evidence: [
          title ? 'title' : '',
          description ? 'description' : '',
          canonical ? 'canonical' : '',
          hasNoIndex ? 'robots:noindex' : 'indexable',
        ].filter(Boolean).join(', '),
      },
    },
  };
};

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

    server.middlewares.use('/api/live-check', async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, 405, { error: 'Use POST to check a live URL.' });
        return;
      }

      let targetUrl = '';
      try {
        const body = await readBody(req);
        const parsed = body ? JSON.parse(body) : {};
        targetUrl = typeof parsed.url === 'string' ? parsed.url.trim() : '';
        const parsedUrl = new URL(targetUrl);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new Error('Only http and https URLs can be checked.');
        }
        targetUrl = parsedUrl.toString();
      } catch (error) {
        sendJson(res, 400, { error: error.message || 'Invalid URL.' });
        return;
      }

      try {
        const response = await fetch(targetUrl, {
          redirect: 'follow',
          headers: {
            'user-agent': 'Aperture live checker',
            accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(12000),
        });
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
          sendJson(res, 200, {
            url: targetUrl,
            finalUrl: response.url || targetUrl,
            status: response.status,
            checkedAt: new Date().toISOString(),
            error: `Expected HTML, received ${contentType || 'unknown content type'}.`,
            checks: {
              favicon: { passed: false, detail: 'Could not inspect favicon because the URL did not return HTML.', evidence: '' },
              ogCard: { passed: false, detail: 'Could not inspect Open Graph tags because the URL did not return HTML.', evidence: '' },
              seo: { passed: false, detail: 'Could not inspect SEO tags because the URL did not return HTML.', evidence: '' },
            },
          });
          return;
        }

        const html = await response.text();
        sendJson(res, 200, await analyzeLiveHtml(targetUrl, html.slice(0, 1_000_000), response));
      } catch (error) {
        sendJson(res, 502, {
          url: targetUrl,
          checkedAt: new Date().toISOString(),
          error: error.message || 'Live check failed.',
        });
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), localScannerPlugin()],
});
