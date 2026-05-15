import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json'; // using the JSON

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Login failed:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      alert("O login foi cancelado. Por favor, tente novamente.");
    } else if (error.code === 'auth/unauthorized-domain') {
      alert("Este domínio não está autorizado no Firebase. Por favor, acesse o Firebase Console e adicione a URL ao 'Authorized domains' em Authentication.");
    } else {
      alert(`Falha no login: ${error.message}`);
    }
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const loginWithEmail = async (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const logout = () => signOut(auth);
