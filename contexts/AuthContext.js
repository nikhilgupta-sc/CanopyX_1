import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { WebBrowser } from 'expo-web-browser';

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

  // Set up auth state listener
  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('Auth state changed:', user);
        setUser(user);
        setLoading(false);
        setAuthError(null);
      },
      (error) => {
        console.error('Auth state error:', error);
        setAuthError(error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      
      const provider = new GoogleAuthProvider();
      
      // For web, use popup
      if (typeof window !== 'undefined') {
        const result = await signInWithPopup(auth, provider);
        console.log('Google sign in successful:', result.user);
        return result;
      } else {
        throw new Error('Google sign in not supported on this platform');
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      setAuthError(error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('Apple sign in - implement with expo-apple-authentication');
      throw new Error('Apple sign in not implemented yet');
    } catch (error) {
      console.error('Apple Sign In Error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Email sign in error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      return userCredential;
    } catch (error) {
      console.error('Email sign up error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    authError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut: signOutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};