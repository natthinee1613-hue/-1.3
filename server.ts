import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Health check routes for Cloud Run container lifecycle
app.get(['/health', '/healthz', '/_ah/health'], (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Safe data file location with /tmp fallback for read-only filesystems
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'officers.json');
const SRC_DATA_FILE = path.resolve(__dirname, 'src', 'data', 'latestPersonnel.json');
const TMP_DATA_DIR = path.resolve('/tmp', 'data');
const TMP_DATA_FILE = path.join(TMP_DATA_DIR, 'officers.json');

function ensureDataDir(): string {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return DATA_FILE;
  } catch {
    try {
      if (!fs.existsSync(TMP_DATA_DIR)) {
        fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
      }
      return TMP_DATA_FILE;
    } catch {
      return '/tmp/officers.json';
    }
  }
}

// Helper to read current published roster
function getPublishedOfficers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    if (fs.existsSync(TMP_DATA_FILE)) {
      const data = fs.readFileSync(TMP_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    if (fs.existsSync(SRC_DATA_FILE)) {
      const data = fs.readFileSync(SRC_DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed reading published officers:', err);
  }
  return null;
}

// API Routes
app.get('/api/officers', (req, res) => {
  const published = getPublishedOfficers();
  if (published && Array.isArray(published)) {
    return res.json({
      success: true,
      count: published.length,
      data: published,
      source: 'published_live_store',
      updatedAt: fs.existsSync(DATA_FILE) ? fs.statSync(DATA_FILE).mtime : new Date(),
    });
  }
  return res.json({
    success: true,
    count: 0,
    data: [],
    source: 'initial_default',
  });
});

app.post('/api/officers', (req, res) => {
  try {
    const { officers, publishedBy } = req.body;
    if (!Array.isArray(officers)) {
      return res.status(400).json({ success: false, error: 'ข้อมูลกำลังพลต้องเป็น Array' });
    }

    const payload = JSON.stringify(officers, null, 2);
    const targetFile = ensureDataDir();

    try {
      fs.writeFileSync(targetFile, payload, 'utf8');
    } catch (e) {
      console.warn('Could not write to primary target, writing to /tmp:', e);
      fs.writeFileSync('/tmp/officers.json', payload, 'utf8');
    }

    // Also backup to src/data/latestPersonnel.json if writable
    try {
      const srcDir = path.resolve(__dirname, 'src', 'data');
      if (fs.existsSync(srcDir)) {
        fs.writeFileSync(SRC_DATA_FILE, payload, 'utf8');
      }
    } catch (e) {
      // Ignored in read-only production environments
    }

    console.log(`[LIVE PUBLISH] Successfully published ${officers.length} officers to live website.`);

    return res.json({
      success: true,
      message: officers.length === 0
        ? 'ลบและอัปเดตระบบให้เป็น 0 อัตรา เรียบร้อยแล้ว'
        : `บันทึกและเผยแพร่ข้อมูลกำลังพลล่าสุด ${officers.length} อัตรา ลงเว็บไซต์เรียบร้อยแล้ว`,
      count: officers.length,
      publishedAt: new Date().toISOString(),
      publishedBy: publishedBy || 'ผู้ดูแลระบบ สกพ.',
    });
  } catch (err: any) {
    console.error('Error saving officers file:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/officers/clear', (req, res) => {
  try {
    const payload = JSON.stringify([], null, 2);
    const targetFile = ensureDataDir();
    try {
      fs.writeFileSync(targetFile, payload, 'utf8');
    } catch {
      fs.writeFileSync('/tmp/officers.json', payload, 'utf8');
    }
    try {
      const srcDir = path.resolve(__dirname, 'src', 'data');
      if (fs.existsSync(srcDir)) {
        fs.writeFileSync(SRC_DATA_FILE, payload, 'utf8');
      }
    } catch (e) {}

    console.log('[CLEAR] Successfully cleared all officers (0 count).');
    return res.json({
      success: true,
      message: 'ลบอัตราข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว (0 อัตรา)',
      count: 0,
      clearedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error clearing officers:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/officers/reset', (req, res) => {
  try {
    const payload = JSON.stringify([], null, 2);
    const targetFile = ensureDataDir();
    try {
      fs.writeFileSync(targetFile, payload, 'utf8');
    } catch {
      fs.writeFileSync('/tmp/officers.json', payload, 'utf8');
    }
    try {
      const srcDir = path.resolve(__dirname, 'src', 'data');
      if (fs.existsSync(srcDir)) {
        fs.writeFileSync(SRC_DATA_FILE, payload, 'utf8');
      }
    } catch (e) {}

    console.log('[RESET] Reset published officers back to initial default (0 rates).');
    return res.json({
      success: true,
      message: 'คืนค่าข้อมูลทำเนียบกำลังพลเริ่มต้นเป็น 0 อัตรา เรียบร้อยแล้ว',
      count: 0,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtml = path.join(distDir, 'index.html');
  const hasDist = fs.existsSync(indexHtml);
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (isProduction && hasDist) {
    console.log('[SERVER] Production mode: Serving static files from dist');
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
      res.sendFile(indexHtml);
    });
  } else {
    console.log('[SERVER] Development mode: Starting Vite middleware');
    try {
      const { createServer } = await import('vite');
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (err) {
      console.error('[SERVER] Failed to start Vite dev server, falling back to dist:', err);
      if (hasDist) {
        app.use(express.static(distDir));
        app.get('*', (req, res) => {
          res.sendFile(indexHtml);
        });
      }
    }
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[POLICE DIRECTORY] Server running on http://0.0.0.0:${PORT}`);
  });

  // Graceful shutdown handling for Cloud Run container signals
  const shutdown = (signal: string) => {
    console.log(`[SERVER] Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      console.log('[SERVER] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
