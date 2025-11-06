import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCVLxKjb6qLL0K0is7HF6d0qU462TK7ASM",
  authDomain: "canopyx-e5d0c.firebaseapp.com",
  projectId: "canopyx-e5d0c",
  storageBucket: "canopyx-e5d0c.firebasestorage.app",
  messagingSenderId: "818108344816",
  appId: "1:818108344816:web:366d5d52e79085974ad535"
};



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };
export default app;
