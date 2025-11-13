import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { 
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';


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

  
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID', // From Google Cloud Console
    iosClientId: 'YOUR_IOS_CLIENT_ID',   // For iOS
    androidClientId: '', // For Android
    webClientId: '818108344816-jh1k9rukdn2j24n079fkq3jhjsphgf5q.apps.googleusercontent.com',   // For web
    responseType: ResponseType.IdToken,
  });

  
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

 
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    try {
     
      
      console.log('Google sign in successful with token:', idToken);
      
      
      const tempUser = {
        uid: 'google-user-' + Date.now(),
        displayName: 'Google User',
        email: 'user@google.com',
        photoURL: null,
        providerId: 'google.com'
      };
      setUser(tempUser);
      
    } catch (error) {
      console.error('Google token sign in error:', error);
      setAuthError(error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...');
      
     
      if (typeof window !== 'undefined' && window.document) {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        console.log('Web Google sign in successful:', result.user);
        return result;
      } 
     
      else {
        await promptAsync();
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
      console.log('Apple sign in - not available on Android');
      throw new Error('Apple Sign-In is only available on iOS devices. Please use Google Sign-In or email login.');
    } catch (error) {
      console.error('Apple Sign In Error:', error);
      setAuthError(error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      console.error('Email sign in error:', error);
      setAuthError(error);
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
        await updateProfile(userCredential.user, {
          displayName: name
        });
      }
      return userCredential;
    } catch (error) {
      console.error('Email sign up error:', error);
      setAuthError(error);
      throw error;
    } finally {
      setLoading(false);
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

