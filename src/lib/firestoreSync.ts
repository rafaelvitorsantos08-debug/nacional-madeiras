import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { mergeDataSafely } from './dataConsistency';

let unsubscribeUserSnapshot: (() => void) | null = null;
let unsubscribeCompanySnapshot: (() => void) | null = null;
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

export const getFirestoreData = (key: string) => currentData[key];

export const subscribeToSync = (key: string, callback: (val: any) => void) => {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  if (auth.currentUser && !isListening) {
    startListening();
  } else if (currentData[key] !== undefined) {
    callback(currentData[key]);
  }

  return () => {
    listeners.get(key)?.delete(callback);
  };
};

/**
 * Direct real-time push for inventory changes.
 * Bypasses debouncing to ensure instant multi-device reflection across all machines.
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
    // 1. Write to company_stock/geral so all devices on the company network update simultaneously
    const compDoc = doc(db, 'company_stock', 'geral');
    await setDoc(compDoc, {
      [category]: stampedItems,
      updatedAt: now,
      updatedBy: userName
    }, { merge: true });

    // 2. Also write to user_configs for per-user backup
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    await setDoc(userDoc, {
      [storageKey]: stampedItems,
      userId: auth.currentUser.uid
    }, { merge: true });

    // Remove from pending keys if present
    pendingKeys.delete(storageKey);
    savePendingKeys(pendingKeys);
  } catch (err) {
    console.error("Erro ao sincronizar estoque com Firestore:", err);
  }
};

export const flushPendingToFirestore = async () => {
  if (!auth.currentUser || (DIRTY_DATA.size === 0 && pendingKeys.size === 0)) return;

  // Gather dirty data
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

  try {
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    await setDoc(userDoc, dataToSave, { merge: true });

    // If stock keys are included, also push to company_stock/geral
    const stockPayload: Record<string, any> = {};
    let hasStock = false;
    const stockCatMap: Record<string, string> = {
      'nm_portas': 'portas',
      'nm_aduelas': 'aduelas',
      'nm_alizares': 'alizares',
      'nm_rodapes': 'rodapes',
    };

    keysBeingSaved.forEach(k => {
      const cat = stockCatMap[k];
      if (cat && Array.isArray(dataToSave[k])) {
        stockPayload[cat] = dataToSave[k];
        hasStock = true;
      }
    });

    if (hasStock) {
      stockPayload.updatedAt = Date.now();
      stockPayload.updatedBy = auth.currentUser.displayName || auth.currentUser.email || 'Usuário';
      const compDoc = doc(db, 'company_stock', 'geral');
      await setDoc(compDoc, stockPayload, { merge: true });
    }
    
    // Successfully saved
    keysBeingSaved.forEach(k => {
      DIRTY_DATA.delete(k);
      pendingKeys.delete(k);
    });
    savePendingKeys(pendingKeys);
  } catch (err) {
    console.error("Erro ao salvar pendências no Firestore:", err);
  }
};

export const pushToFirestore = (key: string, value: any) => {
  if (key.startsWith('nm_active_') || key === 'nm_dark_mode') return;

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
  
  // For stock changes, synchronize immediately without debounce lag
  if (isStock) {
    if (saveTimeout) clearTimeout(saveTimeout);
    flushPendingToFirestore();
    return;
  }

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    flushPendingToFirestore();
  }, 350);
};

export const startListening = () => {
  if (!auth.currentUser || isListening) return;
  isListening = true;

  // Flush any pending data
  flushPendingToFirestore();

  // 1. Listen to shared company stock for instant multi-device inventory synchronization
  try {
    const compDoc = doc(db, 'company_stock', 'geral');
    unsubscribeCompanySnapshot = onSnapshot(compDoc, (docSnap) => {
      if (docSnap.exists()) {
        const compData = docSnap.data();
        const stockCatMap: Record<string, string> = {
          portas: 'nm_portas',
          aduelas: 'nm_aduelas',
          alizares: 'nm_alizares',
          rodapes: 'nm_rodapes',
        };

        let anyStockUpdated = false;

        Object.keys(stockCatMap).forEach(cat => {
          const lsKey = stockCatMap[cat];
          const incomingStock = compData[cat];

          if (Array.isArray(incomingStock)) {
            let localVal: any = undefined;
            if (typeof window !== 'undefined') {
              try {
                const raw = window.localStorage.getItem(lsKey);
                if (raw) localVal = JSON.parse(raw);
              } catch {}
            }

            // Remote snapshot is authoritative for inventory
            const merged = mergeDataSafely(lsKey, localVal, incomingStock, true);
            currentData[lsKey] = merged;

            if (typeof window !== 'undefined') {
              const strVal = JSON.stringify(merged);
              const curStr = JSON.stringify(localVal);
              if (strVal !== curStr) {
                window.localStorage.setItem(lsKey, strVal);
                window.localStorage.setItem('nm_safe_vault_' + lsKey, strVal);
                anyStockUpdated = true;
              }
            }

            if (listeners.has(lsKey)) {
              listeners.get(lsKey)!.forEach(l => l(merged));
            }
          }
        });

        if (anyStockUpdated && typeof window !== 'undefined') {
          window.dispatchEvent(new Event('local-storage-sync'));
          window.dispatchEvent(new CustomEvent('nm-stock-synced', {
            detail: {
              updatedAt: compData.updatedAt || Date.now(),
              updatedBy: compData.updatedBy || 'Outra Máquina'
            }
          }));
        }
      } else {
        // Document does not exist yet on cloud, seed with local inventory
        const initialSeed: Record<string, any> = {
          updatedAt: Date.now(),
          updatedBy: auth.currentUser?.displayName || auth.currentUser?.email || 'Sistema'
        };
        ['portas', 'aduelas', 'alizares', 'rodapes'].forEach(cat => {
          try {
            const raw = window.localStorage.getItem(`nm_${cat}`);
            if (raw) initialSeed[cat] = JSON.parse(raw);
          } catch {}
        });
        setDoc(compDoc, initialSeed, { merge: true }).catch(() => {});
      }
    }, (err) => {
      console.warn("Company stock real-time sync notification:", err.message);
    });
  } catch (err) {
    console.warn("Could not attach company stock listener:", err);
  }

  // 2. Listen to user_configs for all other modules (Controle Saídas, Ferragens, Obras, etc.)
  try {
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    unsubscribeUserSnapshot = onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        
        Object.keys(remoteData).forEach(k => {
          if (k === 'userId') return;

          const remoteVal = remoteData[k];
          let localVal: any = undefined;

          if (typeof window !== 'undefined') {
            try {
              const raw = window.localStorage.getItem(k);
              if (raw) localVal = JSON.parse(raw);
            } catch {}
          }

          // Safe authoritative merge for remote changes
          const safelyMerged = mergeDataSafely(k, localVal, remoteVal, true);
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
        });
      } else {
        flushPendingToFirestore();
      }
    }, (err) => {
      console.error("Firebase user_configs sync error:", err);
    });
  } catch (err) {
    console.error("Could not attach user_configs listener:", err);
  }
};

export const stopListening = () => {
  if (unsubscribeUserSnapshot) {
    unsubscribeUserSnapshot();
    unsubscribeUserSnapshot = null;
  }
  if (unsubscribeCompanySnapshot) {
    unsubscribeCompanySnapshot();
    unsubscribeCompanySnapshot = null;
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
