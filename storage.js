import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/app';
import { QUESTION_BANK } from './constants/QUESTION_BANK';

// Helper to get current Firebase User UID
const getUserId = () => firebase.auth().currentUser?.uid;

// Save data to SecureStore/AsyncStorage AND sync to Firestore
export const saveData = async (key, value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  
  // 1. Local Save (SecureStore fallback to AsyncStorage)
  try {
    await SecureStore.setItemAsync(key, stringValue);
  } catch {
    await AsyncStorage.setItem(key, stringValue);
  }

  // 2. Cloud Sync (Firestore)
  const uid = getUserId();
  if (uid) {
    try {
      await firestore()
        .collection('users')
        .doc(uid)
        .set({
          [key]: value, // Saves data under the specific key (e.g., 'surveyHistory')
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (error) {
      console.error(`Cloud sync failed for ${key}:`, error);
    }
  }
};

// Load data with Cloud-to-Local check
export const loadData = async (key) => {
  let value = null;
  
  // Try local stores first
  try {
    value = await SecureStore.getItemAsync(key);
  } catch {
    value = await AsyncStorage.getItem(key);
  }

  if (value === null) return null;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// New Function: Sync Cloud Data to Local (Use this on Login)
export const syncCloudToLocal = async () => {
  const uid = getUserId();
  if (!uid) return;

  try {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const cloudData = userDoc.data();
      
      // Keys to sync from cloud to local device
      const keysToSync = ['surveyHistory', 'latestSurvey', 'userQuestions'];
      
      for (const key of keysToSync) {
        if (cloudData[key]) {
          const stringValue = JSON.stringify(cloudData[key]);
          await AsyncStorage.setItem(key, stringValue);
        }
      }
      console.log('Cross-device data synced successfully');
    }
  } catch (error) {
    console.error('Error syncing from cloud:', error);
  }
};

// Remove data from all stores
export const removeData = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
  
  // Note: We typically don't delete from Firestore on 'removeData' 
  // unless you specifically want to wipe their cloud backup too.
};

// --- SURVEY & QUESTION LOGIC (Now utilizes updated saveData) ---

export const getUserQuestionSet = async () => {
  const stored = await loadData('userQuestions');
  if (stored) return stored;
  
  const ids = QUESTION_BANK.map((q) => q.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 11);
    
  await saveData('userQuestions', ids);
  return ids;
};

export const saveSurveyToHistory = async (surveyData) => {
  try {
    const history = (await loadData('surveyHistory')) || [];
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      score: surveyData.score,
      totalCO2: surveyData.totalCO2,
      responses: surveyData.responses,
      timestamp: Date.now(),
    };
    
    const updatedHistory = [...history, newEntry];
    
    // These calls now trigger both Local and Firestore updates
    await saveData('surveyHistory', updatedHistory);
    await saveData('latestSurvey', newEntry);
    await saveData('lastSurveyDate', newEntry.date);
    
    return newEntry;
  } catch (error) {
    console.error('Error saving survey to history:', error);
    throw error;
  }
};

export const getSurveyHistory = async () => {
  try {
    const history = (await loadData('surveyHistory')) || [];
    return history.sort((a, b) => new Date(a.date) - new Date(b.date));
  } catch (error) {
    console.error('Error loading survey history:', error);
    return [];
  }
};

export const getLatestSurvey = async () => {
  try {
    return await loadData('latestSurvey');
  } catch (error) {
    console.error('Error loading latest survey:', error);
    return null;
  }
};