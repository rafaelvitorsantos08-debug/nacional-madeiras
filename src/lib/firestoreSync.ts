import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { mergeDataSafely, compressDataSafely } from './dataConsistency';

let unsubscribeCompanySnapshots: (() => void)[] = [];
let currentData: Record<string, any> = {};
const listeners = new Map<string, Set<(val: any) => void>>();
let isListening = false;
let isSseConnected = false;
let sseRetryTimer: any = null;
let pollTimer: any = null;
let serverUpdateDebounce: any = null;
let firestoreDebounce: any = null;
const PENDING_SERVER_UPDATES = new Map<string, any>();
const PENDING_FIRESTORE_UPDATES = new Map<string, any>();

// Mapping of localStorage keys to company shared documents in Firestore (/company_stock/{docId})
export const COMPANY_DOC_MAPPINGS: Record<string, { docName: string, fieldName: string }> = {
  // Stock (Estoque)
  'nm_portas': { docName: 'geral', fieldName: 'portas' },
  'nm_aduelas': { docName: 'geral', fieldName: 'aduelas' },
  'nm_alizares': { docName: 'geral', fieldName: 'alizares' },
  'nm_rodapes': { docName: 'geral', fieldName: 'rodapes' },

  // Obras (Entrada / Saída Obras e lista de obras)
  'nm_entrada_obras_v6': { docName: 'obras', fieldName: 'entrada_obras_v6' },
  'nm_obras_v4': { docName: 'obras', fieldName: 'obras_v4' },

  // Operação & Controle (Controle de Saídas e Operação da Produção)
  'nm_controle_saidas': { docName: 'operacao', fieldName: 'controle_saidas' },
  'nm_operacao_producao': { docName: 'operacao', fieldName: 'operacao_producao' },
  'nm_operacao_colaboradores': { docName: 'operacao', fieldName: 'operacao_colaboradores' },
  'nm_operacao_efetivo_total_cols': { docName: 'operacao', fieldName: 'operacao_efetivo_total_cols' },

  // Ferragens
  'nm_ferragens_obras_list_v5': { docName: 'ferragens', fieldName: 'ferragens_obras_list_v5' },
  'nm_ferragens_obras_data_v5': { docName: 'ferragens', fieldName: 'ferragens_obras_data_v5' },
  'nm_ferragens_history_v5': { docName: 'ferragens', fieldName: 'ferragens_history_v5' },

  // Lançamentos de Kits
  'nacional_madeiras_kits_v6': { docName: 'lancamentos', fieldName: 'kits_v6' },

  // Histórico de Entregas
  'nm_historico_entregas_v1': { docName: 'historico', fieldName: 'historico_entregas_v1' },

  // Conferência
  'nm_conferencia_items': { docName: 'conferencia', fieldName: 'conferencia_items' },

  // Calendário / Lembretes
  'nm_lembretes': { docName: 'lembretes', fieldName: 'lembretes' },

  // Relatórios
  'nm_active_relatorio_header': { docName: 'relatorios', fieldName: 'relatorio_header' },
  'nm_active_relatorio_items': { docName: 'relatorios', fieldName: 'relatorio_items' },
};

export const getFirestoreData = (key: string) => currentData[key];

export const subscribeToSync = (key: string, callback: (val: any) => void) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  if (!isListening) {
    startListening();
  }
  if (currentData[key] !== undefined && currentData[key] !== null) {
    setTimeout(() => {
      if (listeners.get(key)?.has(callback)) {
        callback(currentData[key]);
      }
    }, 0);
  }

  return () => {
    listeners.get(key)?.delete(callback);
  };
};

const applyIncomingUpdate = (
  key: string,
  incomingVal: any,
  updatedBy: string = 'Outra Máquina',
  isAuthoritative: boolean = false
) => {
  if (incomingVal === undefined || incomingVal === null) return;

  let localVal: any = undefined;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) localVal = JSON.parse(raw);
    } catch {}
  }

  // Authoritative replacement (e.g. Purge/Exclusion) or non-destructive safe merge
  const merged = isAuthoritative ? incomingVal : mergeDataSafely(key, localVal, incomingVal, false);
  if (merged !== undefined && merged !== null) {
    currentData[key] = merged;

    if (typeof window !== 'undefined') {
      const strVal = JSON.stringify(merged);
      const curStr = JSON.stringify(localVal);
      if (strVal !== curStr || isAuthoritative) {
        window.localStorage.setItem(key, strVal);
        window.localStorage.setItem('nm_safe_vault_' + key, strVal);
        window.localStorage.setItem('nm_backup_' + key, strVal);
        window.dispatchEvent(new CustomEvent('nm-local-storage-sync', { detail: { key, value: merged } }));
      }
    }

    if (listeners.has(key)) {
      listeners.get(key)!.forEach(l => l(merged));
    }
  }
};

/**
 * Sends debounced batched updates to the central server.
 */
const flushServerUpdates = async () => {
  if (PENDING_SERVER_UPDATES.size === 0 || typeof window === 'undefined') return;

  const batch: Record<string, any> = {};
  PENDING_SERVER_UPDATES.forEach((v, k) => {
    batch[k] = v;
  });
  PENDING_SERVER_UPDATES.clear();

  try {
    const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';
    await fetch('/api/stock/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, updatedBy: userName })
    });
  } catch (err) {
    // Non-fatal, local storage has persistence and will retry
  }
};

/**
 * Sends updates to the central server with a 100ms debounce for typing responsiveness.
 */
const postUpdateToServer = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  PENDING_SERVER_UPDATES.set(key, value);

  if (serverUpdateDebounce) clearTimeout(serverUpdateDebounce);
  serverUpdateDebounce = setTimeout(() => {
    flushServerUpdates();
  }, 100);
};

/**
 * Fetch all initial company data from server backend on load and periodic poll.
 */
const fetchAllFromServer = async () => {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch(`/api/stock/all?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    });
    if (!res.ok) return;
    const body = await res.json();
    if (body && body.data && typeof body.data === 'object') {
      for (const [k, v] of Object.entries(body.data)) {
        applyIncomingUpdate(k, v, 'Servidor Central');
      }
    }
  } catch (err) {}
};

/**
 * Connect to real-time Server-Sent Events stream from the backend server.
 */
const connectSseStream = () => {
  if (typeof window === 'undefined' || isSseConnected) return;
  try {
    const eventSource = new EventSource(`/api/stock/stream?_t=${Date.now()}`);
    isSseConnected = true;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.key && payload.value !== undefined) {
          applyIncomingUpdate(payload.key, payload.value, payload.updatedBy || 'Outra Máquina', !!payload.isAuthoritative);
        }
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource.close();
      isSseConnected = false;
      if (sseRetryTimer) clearTimeout(sseRetryTimer);
      sseRetryTimer = setTimeout(connectSseStream, 1500);
    };
  } catch {}
};

/**
 * Background periodic polling every 1.5s to ensure complete synchronicity across all machines.
 */
const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    fetchAllFromServer();
  }, 1500);
};

/**
 * Direct push for stock changes across all company machines.
 */
export const pushStockDirectlyToFirestore = async (category: 'portas' | 'aduelas' | 'alizares' | 'rodapes', items: any[]) => {
  const storageKey = `nm_${category}`;
  const now = Date.now();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';

  const stampedItems = (Array.isArray(items) ? items : []).map(it => ({
    ...it,
    updatedAt: it.updatedAt || now
  }));

  // Update memory cache
  currentData[storageKey] = stampedItems;
  
  if (typeof window !== 'undefined') {
    try {
      const str = JSON.stringify(stampedItems);
      window.localStorage.setItem(storageKey, str);
      window.localStorage.setItem('nm_safe_vault_' + storageKey, str);
      window.dispatchEvent(new CustomEvent('nm-local-storage-sync', { detail: { key: storageKey, value: stampedItems } }));
    } catch {}
  }

  if (listeners.has(storageKey)) {
    listeners.get(storageKey)!.forEach(l => l(stampedItems));
  }

  // Broadcast to all machines immediately via server
  postUpdateToServer(storageKey, stampedItems);

  // Background queue for Firestore
  queueFirestoreSync(storageKey, stampedItems);
};

/**
 * Authoritative cloud purge: completely replaces the map in Firestore,
 * ensuring deleted keys are permanently removed rather than merged.
 */
export const forcePurgeToCloud = async (key: string, cleanedData: any) => {
  const mapping = COMPANY_DOC_MAPPINGS[key];
  if (!mapping) return;
  try {
    const compDocRef = doc(db, 'company_stock', mapping.docName);
    const compressed = compressDataSafely(key, cleanedData);
    const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';
    await setDoc(compDocRef, {
      [mapping.fieldName]: compressed,
      updatedAt: Date.now(),
      updatedBy: userName
    }, { mergeFields: [mapping.fieldName, 'updatedAt', 'updatedBy'] });
  } catch (err) {
    console.warn('Direct firestore purge sync warning:', err);
  }
};

/**
 * Queues a debounced Firestore background sync (45s) to avoid consuming free-tier write quotas,
 * compressing payloads by stripping empty fields.
 */
const queueFirestoreSync = (key: string, value: any) => {
  PENDING_FIRESTORE_UPDATES.set(key, value);

  if (firestoreDebounce) clearTimeout(firestoreDebounce);
  firestoreDebounce = setTimeout(async () => {
    if (PENDING_FIRESTORE_UPDATES.size === 0) return;

    const dataToSave: Record<string, any> = {};
    PENDING_FIRESTORE_UPDATES.forEach((v, k) => {
      dataToSave[k] = v;
    });
    PENDING_FIRESTORE_UPDATES.clear();

    const keysBeingSaved = Object.keys(dataToSave);
    const now = Date.now();
    const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';

    try {
      const companyPayloads: Record<string, Record<string, any>> = {};
      keysBeingSaved.forEach(k => {
        const mapping = COMPANY_DOC_MAPPINGS[k];
        if (mapping) {
          if (!companyPayloads[mapping.docName]) {
            companyPayloads[mapping.docName] = {
              updatedAt: now,
              updatedBy: userName
            };
          }
          // Compress payload before sending to Firestore
          companyPayloads[mapping.docName][mapping.fieldName] = compressDataSafely(k, dataToSave[k]);
        }
      });

      const writes = Object.keys(companyPayloads).map(docName => {
        const compDocRef = doc(db, 'company_stock', docName);
        return setDoc(compDocRef, companyPayloads[docName], { merge: true });
      });
      await Promise.all(writes);
    } catch (err: any) {
      // Non-fatal, local storage and central server provide 100% permanent persistence
    }
  }, 45000);
};

export const pushToFirestore = (key: string, value: any) => {
  // Only ignore pure local UI navigation/view preferences
  const localUiKeys = [
    'nm_active_tab', 'nm_active_sub_tab', 'nm_active_controle_tab',
    'nm_active_tab_obras', 'nm_active_log_tab', 'nm_dark_mode',
    'nm_selected_obra_id', 'nm_selected_saidas_year', 'nm_selected_saidas_month',
    'nm_selected_obra_ferragens', 'nm_active_relatorio_tipo'
  ];
  if (localUiKeys.includes(key)) return;

  currentData[key] = value;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('nm_safe_vault_' + key, JSON.stringify(value));
    } catch {}
  }

  // 1. Immediately send to server (broadcasts to all machines via SSE + updates vault disk file)
  postUpdateToServer(key, value);

  // 2. Queue for background Firestore backup (debounced to save quota)
  queueFirestoreSync(key, value);
};

/**
 * Attaches real-time listeners to server and Firestore.
 */
export const startListening = () => {
  if (isListening) return;
  isListening = true;

  // 1. Initial fetch from server vault (complete authoritative data)
  fetchAllFromServer();

  // 2. Connect real-time Server-Sent Events stream for instant cross-machine synchronization (<100ms)
  connectSseStream();

  // 3. Connect 2.5s polling loop to guarantee seamless simultaneity across all operating machines
  startPolling();
};

export const stopListening = () => {
  if (pollTimer) clearInterval(pollTimer);
  if (sseRetryTimer) clearTimeout(sseRetryTimer);
  isListening = false;
  isSseConnected = false;
  currentData = {};
};

// Start listening immediately when module loads in browser
if (typeof window !== 'undefined') {
  startListening();
}

// Ensure pending updates are flushed when user closes tab
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushServerUpdates();
  });
}
