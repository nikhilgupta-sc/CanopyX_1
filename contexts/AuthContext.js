import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { useRouter } from 'expo-router';

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
  const router = useRouter();

  // 1. Explicitly define the exact URI you put in the Google Console
  const proxyRedirectUri = 'https://auth.expo.io/@nikeeel/canopyx';

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '818108344816-rskmmeu64fthdc23a8ehg816ei17bvgg.apps.googleusercontent.com',
    webClientId: '818108344816-oq16e4bib2lsn3g4msc9vvndn6fk59hl.apps.googleusercontent.com',
    redirectUri: proxyRedirectUri, // Force it here
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential)
        .then(() => {
          router.replace('/homescreen');
        })
        .catch((error) => console.error("Firebase Auth Error:", error));
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      // Only auto-redirect if user exists and we aren't already home
      if (u) router.replace('/home');
    });
    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    // 2. Pass the options to promptAsync to ensure useProxy is active
    signInWithGoogle: () => promptAsync({ useProxy: true, redirectUri: proxyRedirectUri }),
    signOut: () => {
      signOut(auth).then(() => router.replace('/login'));
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};