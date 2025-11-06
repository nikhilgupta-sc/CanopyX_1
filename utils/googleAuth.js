import * as Google from 'expo-google';
import { Platform } from 'react-native';

// Replace with your actual values
const ANDROID_CLIENT_ID = 'your-android-client-id';
const IOS_CLIENT_ID = 'your-ios-client-id';
const WEB_CLIENT_ID = 'your-web-client-id';

export const signInWithGoogleAsync = async () => {
  try {
    const result = await Google.logInAsync({
      clientId: Platform.select({
        android: ANDROID_CLIENT_ID,
        ios: IOS_CLIENT_ID,
        default: WEB_CLIENT_ID
      }),
      scopes: ['profile', 'email'],
    });

    return result;
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error;
  }
};

// Get Google client IDs from Firebase:
// Firebase Console → Authentication → Sign-in method → Google → Web SDK configuration