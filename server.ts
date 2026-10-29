import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const vaultPath = path.join(dataDir, 'company_stock_vault.json');

// In-memory cache of company data
let companyData: Record<string, any> = {};

if (fs.existsSync(vaultPath)) {
  try {
    companyData = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  } catch (e) {
    console.warn('Failed to parse existing vault, starting fresh', e);
  }
}

// Save debounce timer
let saveTimer: any = null;
const persistToDisk = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      fs.writeFileSync(vaultPath, JSON.stringify(companyData, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing vault to disk:', e);
    }
  }, 200);
};

// SSE Connected Clients
type Client = {
  id: number;
  res: express.Response;
};
let clients: Client[] = [];
let nextClientId = 1;

const broadcastUpdate = (key: string, value: any, updatedBy: string = 'Sistema') => {
  const payload = JSON.stringify({
    key,
    value,
    updatedAt: Date.now(),
    updatedBy,
  });

  clients.forEach(c => {
    try {
      c.res.write(`data: ${payload}\n\n`);
    } catch {}
  });
};

// API: Get all company stock data
app.get('/api/stock/all', (_req, res) => {
  res.json({
    success: true,
    data: companyData,
    timestamp: Date.now()
  });
});

// API: Update a specific key or batch
app.post('/api/stock/update', (req, res) => {
  try {
    const { key, value, batch, updatedBy } = req.body;

    if (batch && typeof batch === 'object') {
      for (const [k, v] of Object.entries(batch)) {
        companyData[k] = v;
        broadcastUpdate(k, v, updatedBy || 'Outra Máquina');
      }
      persistToDisk();
      return res.json({ success: true, count: Object.keys(batch).length });
    }

    if (!key) {
      return res.status(400).json({ error: 'Missing key' });
    }

    companyData[key] = value;
    persistToDisk();
    broadcastUpdate(key, value, updatedBy || 'Outra Máquina');

    return res.json({ success: true, key });
  } catch (err: any) {
    console.error('API update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Real-time SSE stream
app.get('/api/stock/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = nextClientId++;
  const client: Client = { id: clientId, res };
  clients.push(client);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Keep-alive heartbeat every 20 seconds
setInterval(() => {
  clients.forEach(c => {
    try {
      c.res.write(`: heartbeat\n\n`);
    } catch {}
  });
}, 20000);

// Setup Vite middlewares in development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`> Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
