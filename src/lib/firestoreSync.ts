import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

let unsubscribeSnapshot: (() => void) | null = null;
let currentData: any = {};
const listeners = new Map<string, Set<(val: any) => void>>();
let isListening = false;
let saveTimeout: any = null;
const DIRTY_DATA = new Map<string, any>();

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

export const pushToFirestore = (key: string, value: any) => {
  if (!auth.currentUser) return;
  // Ignore purely ephemeral UI state
  if (key.startsWith('nm_active_') || key === 'nm_dark_mode') return;

  DIRTY_DATA.set(key, value);
  currentData[key] = value; // update local cache

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (!auth.currentUser) return;
    const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
    const dataToSave = Object.fromEntries(DIRTY_DATA);
    dataToSave.userId = auth.currentUser.uid;
    DIRTY_DATA.clear();
    
    setDoc(userDoc, dataToSave, { merge: true }).catch(console.error);
  }, 1000);
};

export const startListening = () => {
  if (!auth.currentUser || isListening) return;
  isListening = true;
  const userDoc = doc(db, 'user_configs', auth.currentUser.uid);
  unsubscribeSnapshot = onSnapshot(userDoc, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      currentData = { ...currentData, ...data };
      Object.keys(data).forEach(k => {
        // notify listeners if the key exists
        const val = data[k];
        if (listeners.has(k)) {
          listeners.get(k)!.forEach(l => l(val));
        }
      });
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
