import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
// If using Expo Router:
import { useRouter } from 'expo-router'; 
// OR if using React Navigation:
// import { useNavigation } from '@react-navigation/native';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter(); // Initialize router

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'canopyx',
    path: 'oauth2redirect',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '818108344816-rskmmeu64fthdc23a8ehg816ei17bvgg.apps.googleusercontent.com',
    webClientId: '818108344816-oq16e4bib2lsn3g4msc9vvndn6fk59hl.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      setLoading(true);
      signInWithCredential(auth, credential)
        .then(() => {
          // REDIRECT TO HOME AFTER FIREBASE SUCCESS
          router.replace('/home'); // Change '/home' to your actual route name
        })
        .catch(err => setAuthError(err.message))
        .finally(() => setLoading(false));
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        // AUTO-REDIRECT IF USER IS ALREADY LOGGED IN
        router.replace('/home'); 
      }
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    setAuthError(null);
    promptAsync({ useProxy: false, redirectUri });
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut: () => {
        signOut(auth);
        router.replace('/login'); // Redirect to login on signout
    },
    // ... other methods
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};