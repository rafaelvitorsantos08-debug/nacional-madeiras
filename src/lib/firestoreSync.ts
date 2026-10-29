import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { mergeDataSafely } from './dataConsistency';

let unsubscribeCompanySnapshots: (() => void)[] = [];
let unsubscribeUserSnapshot: (() => void) | null = null;
let currentData: any = {};
const listeners = new Map<string, Set<(val: any) => void>>();
let isListening = false;
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
  // Stock
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
  'nm_ferragens_obras': { docName: 'ferragens', fieldName: 'ferragens_obras' },
  'nm_ferragens_history': { docName: 'ferragens', fieldName: 'ferragens_history' },

  // Histórico e Lançamentos
  'nm_historico_lancamentos': { docName: 'historico', fieldName: 'historico_lancamentos' },
};

export const getFirestoreData = (key: string) => currentData[key];

export const subscribeToSync = (key: string, callback: (val: any) => void) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  if (auth.currentUser && !isListening) {
    startListening();
  } else if (currentData[key] !== undefined && currentData[key] !== null) {
    callback(currentData[key]);
  }

  return () => {
    listeners.get(key)?.delete(callback);
  };
};

/**
 * Direct push for stock changes across all company machines.
 */
export const pushStockDirectlyToFirestore = async (category: 'portas' | 'aduelas' | 'alizares' | 'rodapes', items: any[]) => {
  const storageKey = `nm_${category}`;
  const now = Date.now();
  const userName = auth.currentUser?.displayName || auth.currentUser?.email || 'Usuário';

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
      window.dispatchEvent(new Event('local-storage-sync'));
    } catch {}
  }

  if (listeners.has(storageKey)) {
    listeners.get(storageKey)!.forEach(l => l(stampedItems));
  }

  if (!auth.currentUser) return;

  try {
    const compDoc = doc(db, 'company_stock', 'geral');
    await setDoc(compDoc, {
      [category]: stampedItems,
      updatedAt: now,
      updatedBy: userName
    }, { merge: true });

    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    await setDoc(userDoc, {
      [storageKey]: stampedItems,
      userId: auth.currentUser.uid
    }, { merge: true });

    pendingKeys.delete(storageKey);
    savePendingKeys(pendingKeys);
  } catch (err) {
    console.error("Erro ao sincronizar estoque com Firestore:", err);
  }
};

/**
 * Flushes all pending and dirty changes to shared company documents in Firestore.
 * Ensures instant synchronization across all machines operating the system.
 */
export const flushPendingToFirestore = async () => {
  if (!auth.currentUser || (DIRTY_DATA.size === 0 && pendingKeys.size === 0)) return;

  const dataToSave: Record<string, any> = { userId: auth.currentUser.uid };
  
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

  const keysBeingSaved = Object.keys(dataToSave).filter(k => k !== 'userId');
  if (keysBeingSaved.length === 0) return;

  const now = Date.now();
  const userName = auth.currentUser.displayName || auth.currentUser.email || 'Usuário';

  try {
    // 1. Group payloads by shared company doc
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

    // 2. Write to each shared company document
    const companyWrites = Object.keys(companyPayloads).map(docName => {
      const compDocRef = doc(db, 'company_stock', docName);
      return setDoc(compDocRef, companyPayloads[docName], { merge: true });
    });
    await Promise.all(companyWrites);

    // 3. Also write to user_configs for per-user backup
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    await setDoc(userDoc, dataToSave, { merge: true });
    
    // Clear dirty data
    keysBeingSaved.forEach(k => {
      DIRTY_DATA.delete(k);
      pendingKeys.delete(k);
    });
    savePendingKeys(pendingKeys);
  } catch (err) {
    console.error("Erro ao salvar dados no Firestore:", err);
  }
};

export const pushToFirestore = (key: string, value: any) => {
  if (key.startsWith('nm_active_') || key === 'nm_dark_mode' || key === 'nm_selected_obra_id') return;

  DIRTY_DATA.set(key, value);
  currentData[key] = value;
  
  pendingKeys.add(key);
  savePendingKeys(pendingKeys);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('nm_safe_vault_' + key, JSON.stringify(value));
    } catch {}
  }

  if (!auth.currentUser) return;

  const isStock = key === 'nm_portas' || key === 'nm_aduelas' || key === 'nm_alizares' || key === 'nm_rodapes';
  
  // For stock changes, synchronize immediately without debounce
  if (isStock) {
    if (saveTimeout) clearTimeout(saveTimeout);
    flushPendingToFirestore();
    return;
  }

  // 250ms debounce for typing/regular inputs to keep real-time sync fast and responsive
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    flushPendingToFirestore();
  }, 250);
};

/**
 * Attaches real-time listeners to all shared company documents and user configs.
 */
export const startListening = () => {
  if (!auth.currentUser || isListening) return;
  isListening = true;

  // Documents in company_stock to listen to for company-wide real-time collaboration
  const companyDocsToListen = ['geral', 'obras', 'operacao', 'ferragens', 'historico'];

  companyDocsToListen.forEach(docName => {
    try {
      const compDoc = doc(db, 'company_stock', docName);
      const unsub = onSnapshot(compDoc, (docSnap) => {
        // If write is still pending locally from this machine, avoid overwriting in-flight inputs
        if (docSnap.metadata.hasPendingWrites) {
          return;
        }

        if (docSnap.exists()) {
          const compData = docSnap.data();
          let anyUpdated = false;

          // Process all mappings that belong to this docName
          Object.keys(COMPANY_DOC_MAPPINGS).forEach(lsKey => {
            const mapping = COMPANY_DOC_MAPPINGS[lsKey];
            if (mapping.docName === docName) {
              const incomingVal = compData[mapping.fieldName];

              if (incomingVal !== undefined && incomingVal !== null) {
                let localVal: any = undefined;
                if (typeof window !== 'undefined') {
                  try {
                    const raw = window.localStorage.getItem(lsKey);
                    if (raw) localVal = JSON.parse(raw);
                  } catch {}
                }

                // Merge incoming cloud data safely
                const merged = mergeDataSafely(lsKey, localVal, incomingVal, true);
                if (merged !== undefined && merged !== null) {
                  currentData[lsKey] = merged;

                  if (typeof window !== 'undefined') {
                    const strVal = JSON.stringify(merged);
                    const curStr = JSON.stringify(localVal);
                    if (strVal !== curStr) {
                      window.localStorage.setItem(lsKey, strVal);
                      window.localStorage.setItem('nm_safe_vault_' + lsKey, strVal);
                      anyUpdated = true;
                    }
                  }

                  if (listeners.has(lsKey)) {
                    listeners.get(lsKey)!.forEach(l => l(merged));
                  }
                }
              }
            }
          });

          if (anyUpdated && typeof window !== 'undefined') {
            window.dispatchEvent(new Event('local-storage-sync'));
            window.dispatchEvent(new CustomEvent('nm-stock-synced', {
              detail: {
                updatedAt: compData.updatedAt || Date.now(),
                updatedBy: compData.updatedBy || 'Outra Máquina',
                docName
              }
            }));
          }
        } else {
          // Document does not exist yet on cloud, seed it from local if local has data
          const initialSeed: Record<string, any> = {
            updatedAt: Date.now(),
            updatedBy: auth.currentUser?.displayName || auth.currentUser?.email || 'Sistema'
          };
          let hasLocalContent = false;

          Object.keys(COMPANY_DOC_MAPPINGS).forEach(lsKey => {
            const mapping = COMPANY_DOC_MAPPINGS[lsKey];
            if (mapping.docName === docName) {
              try {
                const raw = window.localStorage.getItem(lsKey);
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (parsed && (Array.isArray(parsed) ? parsed.length > 0 : Object.keys(parsed).length > 0)) {
                    initialSeed[mapping.fieldName] = parsed;
                    hasLocalContent = true;
                  }
                }
              } catch {}
            }
          });

          if (hasLocalContent) {
            setDoc(compDoc, initialSeed, { merge: true }).catch(() => {});
          }
        }
      }, (err) => {
        console.warn(`Company sync notification for ${docName}:`, err.message);
      });

      unsubscribeCompanySnapshots.push(unsub);
    } catch (err) {
      console.warn(`Could not attach company listener for ${docName}:`, err);
    }
  });

  // Also listen to user_configs for any personal/additional preferences
  try {
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    unsubscribeUserSnapshot = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.metadata.hasPendingWrites) return;

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        
        Object.keys(remoteData).forEach(k => {
          if (k === 'userId') return;

          const remoteVal = remoteData[k];
          if (remoteVal === undefined || remoteVal === null) return;

          let localVal: any = undefined;

          if (typeof window !== 'undefined') {
            try {
              const raw = window.localStorage.getItem(k);
              if (raw) localVal = JSON.parse(raw);
            } catch {}
          }

          const safelyMerged = mergeDataSafely(k, localVal, remoteVal, true);
          if (safelyMerged !== undefined && safelyMerged !== null) {
            currentData[k] = safelyMerged;

            if (typeof window !== 'undefined') {
              const stringified = JSON.stringify(safelyMerged);
              if (stringified !== JSON.stringify(localVal)) {
                window.localStorage.setItem(k, stringified);
                window.localStorage.setItem('nm_safe_vault_' + k, stringified);
                window.dispatchEvent(new Event('local-storage-sync'));
              }
            }

            if (listeners.has(k)) {
              listeners.get(k)!.forEach(l => l(safelyMerged));
            }
          }
        });
      }
    }, (err) => {
      console.warn("User configs sync warning:", err.message);
    });
  } catch (err) {
    console.warn("Could not attach user_configs listener:", err);
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

auth.onAuthStateChanged((user) => {
  if (user) {
    startListening();
  } else {
    stopListening();
  }
});

// Lifecycle handlers to ensure flush on close/hide
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushPendingToFirestore();
  });
  window.addEventListener('pagehide', () => {
    flushPendingToFirestore();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingToFirestore();
    }
  });
}
