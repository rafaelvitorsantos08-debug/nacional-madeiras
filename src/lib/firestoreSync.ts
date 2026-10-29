import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { mergeDataSafely } from './dataConsistency';

let unsubscribeCompanySnapshots: (() => void)[] = [];
let unsubscribeUserSnapshot: (() => void) | null = null;
let currentData: any = {};
const listeners = new Map<string, Set<(val: any) => void>>();
let isListening = false;
let isSseConnected = false;
let saveTimeout: any = null;
const DIRTY_DATA = new Map<string, any>();

// Storage key for pending keys
const PENDING_KEYS_STORAGE_KEY = 'nm_pending_cloud_sync_keys';
const getPendingKeys = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(PENDING_KEYS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const savePendingKeys = (keys: Set<string>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PENDING_KEYS_STORAGE_KEY, JSON.stringify(Array.from(keys)));
  } catch {}
};

const pendingKeys = getPendingKeys();

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

/**
 * Apply incoming remote update to local store safely.
 */
const applyIncomingUpdate = (key: string, incomingVal: any, updatedBy: string = 'Outra Máquina') => {
  if (incomingVal === undefined || incomingVal === null) return;
  if (DIRTY_DATA.has(key)) return; // Don't clobber active typing

  let localVal: any = undefined;
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) localVal = JSON.parse(raw);
    } catch {}
  }

  const merged = mergeDataSafely(key, localVal, incomingVal, true);
  if (merged !== undefined && merged !== null) {
    currentData[key] = merged;

    if (typeof window !== 'undefined') {
      const strVal = JSON.stringify(merged);
      const curStr = JSON.stringify(localVal);
      if (strVal !== curStr) {
        window.localStorage.setItem(key, strVal);
        window.localStorage.setItem('nm_safe_vault_' + key, strVal);
        window.dispatchEvent(new CustomEvent('nm-local-storage-sync', { detail: { key, value: merged } }));
      }
    }

    if (listeners.has(key)) {
      listeners.get(key)!.forEach(l => l(merged));
    }
  }
};

/**
 * Send update to server backend API.
 */
const postUpdateToServer = async (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';
    await fetch('/api/stock/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, updatedBy: userName })
    });
  } catch (err) {
    // Non-fatal, local storage and Firestore handles persistence
  }
};

/**
 * Fetch all initial company data from server backend on load.
 */
const fetchAllFromServer = async () => {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/stock/all');
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
    const eventSource = new EventSource('/api/stock/stream');
    isSseConnected = true;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.key && payload.value !== undefined) {
          applyIncomingUpdate(payload.key, payload.value, payload.updatedBy || 'Outra Máquina');
        }
      } catch {}
    };

    eventSource.onerror = () => {
      eventSource.close();
      isSseConnected = false;
      // Retry in 3 seconds
      setTimeout(connectSseStream, 3000);
    };
  } catch {}
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

  // 1. Send to server backend immediately for instant multi-machine sync
  postUpdateToServer(storageKey, stampedItems);

  // 2. Also sync to Firestore company_stock
  try {
    const compDoc = doc(db, 'company_stock', 'geral');
    await setDoc(compDoc, {
      [category]: stampedItems,
      updatedAt: now,
      updatedBy: userName
    }, { merge: true });

    pendingKeys.delete(storageKey);
    savePendingKeys(pendingKeys);
  } catch (err) {
    // Non-fatal, server has persistence
  }
};

/**
 * Flushes all pending changes to shared company documents in Firestore.
 */
export const flushPendingToFirestore = async () => {
  if (DIRTY_DATA.size === 0 && pendingKeys.size === 0) return;

  const dataToSave: Record<string, any> = {};
  
  DIRTY_DATA.forEach((val, k) => {
    dataToSave[k] = val;
  });

  if (typeof window !== 'undefined') {
    pendingKeys.forEach(k => {
      try {
        const val = window.localStorage.getItem(k);
        if (val) dataToSave[k] = JSON.parse(val);
      } catch {}
    });
  }

  const keysBeingSaved = Object.keys(dataToSave);
  if (keysBeingSaved.length === 0) return;

  const now = Date.now();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Estação';

  // Always update server backend
  for (const k of keysBeingSaved) {
    postUpdateToServer(k, dataToSave[k]);
  }

  // Clear in-flight flags immediately once server is notified
  keysBeingSaved.forEach(k => {
    DIRTY_DATA.delete(k);
    pendingKeys.delete(k);
  });
  savePendingKeys(pendingKeys);

  // Group payloads by shared company doc in Firestore
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
        companyPayloads[mapping.docName][mapping.fieldName] = dataToSave[k];
      }
    });

    const companyWrites = Object.keys(companyPayloads).map(docName => {
      const compDocRef = doc(db, 'company_stock', docName);
      return setDoc(compDocRef, companyPayloads[docName], { merge: true });
    });
    await Promise.all(companyWrites);

    // Optional user backup if signed in
    if (auth.currentUser) {
      try {
        const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
        await setDoc(userDoc, { ...dataToSave, userId: auth.currentUser.uid }, { merge: true });
      } catch {}
    }
  } catch (err: any) {
    // If Firestore write quota is reached, server still has all data saved on disk
  }
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

  DIRTY_DATA.set(key, value);
  currentData[key] = value;
  
  pendingKeys.add(key);
  savePendingKeys(pendingKeys);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('nm_safe_vault_' + key, JSON.stringify(value));
    } catch {}
  }

  // Stock changes are pushed immediately
  const isStock = key === 'nm_portas' || key === 'nm_aduelas' || key === 'nm_alizares' || key === 'nm_rodapes';
  if (isStock) {
    if (saveTimeout) clearTimeout(saveTimeout);
    flushPendingToFirestore();
    return;
  }

  // 400ms debounce for typing to balance instant multi-machine responsiveness with quota preservation
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    flushPendingToFirestore();
  }, 400);
};

/**
 * Attaches real-time listeners to all shared company documents and user configs.
 */
export const startListening = () => {
  if (isListening) return;
  isListening = true;

  // 1. Initial fetch and SSE stream from local server
  fetchAllFromServer();
  connectSseStream();

  // 2. Documents in company_stock to listen to for company-wide real-time collaboration
  const companyDocsToListen = Array.from(new Set(Object.values(COMPANY_DOC_MAPPINGS).map(m => m.docName)));

  companyDocsToListen.forEach(docName => {
    try {
      const compDoc = doc(db, 'company_stock', docName);
      const unsub = onSnapshot(compDoc, (docSnap) => {
        if (docSnap.metadata.hasPendingWrites) {
          return;
        }

        if (docSnap.exists()) {
          const compData = docSnap.data();

          // Process all mappings that belong to this docName
          Object.keys(COMPANY_DOC_MAPPINGS).forEach(lsKey => {
            const mapping = COMPANY_DOC_MAPPINGS[lsKey];
            if (mapping.docName === docName) {
              const incomingVal = compData[mapping.fieldName];
              if (incomingVal !== undefined && incomingVal !== null) {
                applyIncomingUpdate(lsKey, incomingVal, compData.updatedBy || 'Outra Máquina');
              }
            }
          });
        }
      }, (err) => {
        // Non-fatal, server SSE provides real-time updates
      });

      unsubscribeCompanySnapshots.push(unsub);
    } catch (err) {}
  });

  // Optional: listen to user_configs if authenticated
  if (auth.currentUser) {
    try {
      const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
      unsubscribeUserSnapshot = onSnapshot(userDoc, (docSnap) => {
        if (docSnap.metadata.hasPendingWrites || !docSnap.exists()) return;
        const remoteData = docSnap.data();
        Object.keys(remoteData).forEach(k => {
          if (k === 'userId') return;
          applyIncomingUpdate(k, remoteData[k], 'Configurações Pessoais');
        });
      }, () => {});
    } catch {}
  }
};

export const stopListening = () => {
  unsubscribeCompanySnapshots.forEach(unsub => unsub());
  unsubscribeCompanySnapshots = [];
  if (unsubscribeUserSnapshot) {
    unsubscribeUserSnapshot();
    unsubscribeUserSnapshot = null;
  }
  isListening = false;
  currentData = {};
};

// Start listening immediately when module loads in browser
if (typeof window !== 'undefined') {
  startListening();
}

// Lifecycle handlers to ensure flush on close/hide
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushPendingToFirestore();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingToFirestore();
    }
  });
}
