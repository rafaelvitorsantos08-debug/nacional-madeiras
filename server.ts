import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { mergeDataSafely, compressDataSafely, purgeOldData } from './src/lib/dataConsistency.ts';

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
const backupPath = path.join(dataDir, 'company_stock_vault.bak.json');

// In-memory cache of company data
let companyData: Record<string, any> = {};

if (fs.existsSync(vaultPath)) {
  try {
    companyData = JSON.parse(fs.readFileSync(vaultPath, 'utf8'));
  } catch (e) {
    console.warn('Failed to parse existing vault, attempting backup', e);
    if (fs.existsSync(backupPath)) {
      try {
        companyData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      } catch {}
    }
  }
}

// Save debounce timer
let saveTimer: any = null;
const persistToDisk = () => {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const content = JSON.stringify(companyData, null, 2);
      fs.writeFileSync(vaultPath, content, 'utf8');
      fs.writeFileSync(backupPath, content, 'utf8');
    } catch (e) {
      console.error('Error writing vault to disk:', e);
    }
  }, 100);
};

// SSE Connected Clients
type Client = {
  id: number;
  res: express.Response;
};
let clients: Client[] = [];
let nextClientId = 1;

const broadcastUpdate = (key: string, value: any, updatedBy: string = 'Sistema', isAuthoritative: boolean = false) => {
  const payload = JSON.stringify({
    key,
    value,
    updatedAt: Date.now(),
    updatedBy,
    isAuthoritative
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

// API: Poll company stock data
app.get('/api/stock/poll', (_req, res) => {
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
        const merged = mergeDataSafely(k, companyData[k], v, false);
        companyData[k] = merged;
        broadcastUpdate(k, merged, updatedBy || 'Outra Máquina');
      }
      persistToDisk();
      return res.json({ success: true, count: Object.keys(batch).length });
    }

    if (!key) {
      return res.status(400).json({ error: 'Missing key' });
    }

    const merged = mergeDataSafely(key, companyData[key], value, false);
    companyData[key] = merged;
    persistToDisk();
    broadcastUpdate(key, merged, updatedBy || 'Outra Máquina');

    return res.json({ success: true, key, value: merged });
  } catch (err: any) {
    console.error('API update error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Compress all stored collections to eliminate empty keys and reduce payload
app.post('/api/stock/compress', (_req, res) => {
  try {
    const updatedKeys: string[] = [];
    for (const [k, v] of Object.entries(companyData)) {
      const compressed = compressDataSafely(k, v);
      companyData[k] = compressed;
      updatedKeys.push(k);
      broadcastUpdate(k, compressed, 'Otimização de Armazenamento');
    }
    persistToDisk();
    return res.json({ success: true, updatedKeys, count: updatedKeys.length });
  } catch (err: any) {
    console.error('Compress error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Purge old historical records prior to a cutoff date
app.post('/api/stock/purge-old', (req, res) => {
  try {
    const { module, cutoffDate, updatedBy } = req.body;
    if (!module || !cutoffDate) {
      return res.status(400).json({ error: 'Missing module or cutoffDate' });
    }

    let targetKey = '';
    let modType: 'saidas' | 'operacao' | 'historico' = 'saidas';

    if (module === 'saidas') {
      targetKey = 'nm_controle_saidas';
      modType = 'saidas';
    } else if (module === 'operacao') {
      targetKey = 'nm_operacao_producao';
      modType = 'operacao';
    } else if (module === 'historico') {
      targetKey = 'nm_historico_entregas_v1';
      modType = 'historico';
    } else {
      return res.status(400).json({ error: 'Invalid module' });
    }

    const currentVal = companyData[targetKey];
    const { cleanedData, removedCount, keptCount } = purgeOldData(modType, cutoffDate, currentVal);

    companyData[targetKey] = cleanedData;
    persistToDisk();
    broadcastUpdate(targetKey, cleanedData, updatedBy || 'Limpeza de Dados Antigos', true);

    return res.json({ success: true, module, targetKey, removedCount, keptCount });
  } catch (err: any) {
    console.error('Purge error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// API: Real-time SSE stream with immediate flush
app.get('/api/stock/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
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

// Keep-alive heartbeat every 15 seconds
setInterval(() => {
  clients.forEach(c => {
    try {
      c.res.write(`: heartbeat\n\n`);
    } catch {}
  });
}, 15000);

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
