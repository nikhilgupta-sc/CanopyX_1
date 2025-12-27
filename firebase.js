import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCVLxKjb6qLL0K0is7HF6d0qU462TK7ASM",
  authDomain: "canopyx-e5d0c.firebaseapp.com",
  projectId: "canopyx-e5d0c",
  storageBucket: "canopyx-e5d0c.firebasestorage.app",
  messagingSenderId: "818108344816",
  appId: "1:818108344816:web:366d5d52e79085974ad535"
};

// 1. Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Auth with Persistence (Fixed for React Native)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 3. Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;