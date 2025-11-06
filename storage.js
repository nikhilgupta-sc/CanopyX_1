import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QUESTION_BANK } from './constants/QUESTION_BANK';

// Save data to SecureStore, fallback to AsyncStorage
export const saveData = async (key, value) => {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    await SecureStore.setItemAsync(key, stringValue);
  } catch {
    await AsyncStorage.setItem(key, stringValue);
  }
};

// Load data from SecureStore, fallback to AsyncStorage
export const loadData = async (key) => {
  let value = null;
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

// Remove data from both stores
export const removeData = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {}
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
};

// Pick and persist 11 unique question IDs for the user
export const getUserQuestionSet = async () => {
  const stored = await loadData('userQuestions');
  if (stored) return stored;
  const ids = QUESTION_BANK.map((q) => q.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 11);
  await saveData('userQuestions', ids);
  return ids;
};

// Survey History Functions
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
