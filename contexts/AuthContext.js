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

// Required to complete the flow back to the app from the browser
WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 1. GENERATE REDIRECT URI
  // This tells Google where to send the user back (canopyx://)
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'canopyx',
  });

  // 2. GOOGLE AUTH REQUEST
  // We pass the redirectUri here so the hook matches the Google Console settings
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: '818108344816-rskmmeu64fthdc23a8ehg816ei17bvgg.apps.googleusercontent.com',
    webClientId: '818108344816-oq16e4bib2lsn3g4msc9vvndn6fk59hl.apps.googleusercontent.com',
    redirectUri, 
  });

  // 3. LISTEN FOR FIREBASE AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 4. HANDLE GOOGLE RESPONSE
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error' || response?.type === 'cancel') {
      console.log("Google Auth Status:", response.type, response?.error);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      setAuthError(null);
    } catch (error) {
      console.error('Firebase Google Auth Error:', error);
      setAuthError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      // promptAsync triggers the system browser
      await promptAsync(); 
    } catch (error) {
      console.error("Sign-in trigger error:", error);
      setAuthError(error.message);
    }
  };

  // --- EMAIL & PASSWORD FUNCTIONS ---
  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const result = await signInWithEmailAndPassword(auth, email, password);
      setAuthError(null);
      return result;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      setAuthError(null);
      return userCredential;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const value = {
    user,
    loading,
    authError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut: signOutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};