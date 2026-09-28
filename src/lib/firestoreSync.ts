import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { mergeDataSafely, restoreTodayAndConsistentRecords } from './dataConsistency';

let unsubscribeSnapshot: (() => void) | null = null;
let currentData: any = {};
const listeners = new Map<string, Set<(val: any) => void>>();
let isListening = false;
let saveTimeout: any = null;
const DIRTY_DATA = new Map<string, any>();

// Load any pending unsynced keys from local storage
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

export const flushPendingToFirestore = async () => {
  if (!auth.currentUser || (DIRTY_DATA.size === 0 && pendingKeys.size === 0)) return;

  // Gather all dirty data
  const dataToSave: Record<string, any> = { userId: auth.currentUser.uid };
  
  DIRTY_DATA.forEach((val, k) => {
    dataToSave[k] = val;
  });

  // Also include any pending keys from localStorage
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
    
    // Successfully saved
    keysBeingSaved.forEach(k => {
      DIRTY_DATA.delete(k);
      pendingKeys.delete(k);
    });
    savePendingKeys(pendingKeys);
  } catch (err) {
    console.error("Erro ao sincronizar com Firestore:", err);
  }
};

export const pushToFirestore = (key: string, value: any) => {
  // Ignore purely ephemeral UI state
  if (key.startsWith('nm_active_') || key === 'nm_dark_mode') return;

  // Always update local memory cache and persistent vault
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

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    flushPendingToFirestore();
  }, 400); // responsive debounce
};

export const startListening = () => {
  if (!auth.currentUser || isListening) return;
  isListening = true;

  // First flush any pending offline or pre-auth writes to Firestore
  flushPendingToFirestore();

  const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
  unsubscribeSnapshot = onSnapshot(userDoc, (docSnap) => {
    if (docSnap.exists()) {
      const remoteData = docSnap.data();
      
      // Update keys with safe merge
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

        // If local has pending dirty uncommitted changes, do not let remote overwrite it!
        if (pendingKeys.has(k) && localVal !== undefined) {
          // Push local to remote
          pushToFirestore(k, localVal);
          return;
        }

        // Safe merge: local records and remote records combined without wiping anything
        const safelyMerged = mergeDataSafely(k, localVal, remoteVal);
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
      // If doc does not exist yet on cloud, seed with current local data
      flushPendingToFirestore();
    }
  }, (err) => {
    console.error("Firebase sync error:", err);
  });
};

export const stopListening = () => {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
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

// Window lifecycle listeners to ensure no write is ever dropped
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
