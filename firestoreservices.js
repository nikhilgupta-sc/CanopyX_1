import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';

// Get all survey questions from Firestore (or use local fallback)
export const getSurveyQuestions = async () => {
  try {
    const surveyRef = doc(db, 'surveys', 'climate_survey');
    const surveyDoc = await getDoc(surveyRef);
    
    if (surveyDoc.exists()) {
      return surveyDoc.data().questions;
    } else {
      console.log('No survey in Firestore, using local questions');
      return null; // Will fall back to local QUESTION_BANK
    }
  } catch (error) {
    console.error('Error getting survey questions from Firestore:', error);
    return null; // Fall back to local
  }
};

// Save user survey responses to Firestore
export const saveSurveyResponse = async (userId, surveyData) => {
  try {
    const responsesRef = collection(db, 'survey_responses');
    const responseData = {
      userId: userId,
      responses: surveyData.responses,
      score: surveyData.score,
      totalCO2: surveyData.totalCO2,
      questionIds: surveyData.questionIds,
      completedAt: new Date().toISOString(),
      surveyDate: new Date().toLocaleDateString()
    };
    
    const docRef = await addDoc(responsesRef, responseData);
    
    // Also save locally for offline access
    if (typeof saveSurveyToHistory === 'function') {
      await saveSurveyToHistory(surveyData);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving survey response to Firestore:', error);
    // Fall back to local storage
    if (typeof saveSurveyToHistory === 'function') {
      return await saveSurveyToHistory(surveyData);
    }
    throw error;
  }
};

// Get user's survey history from Firestore
export const getUserSurveyHistory = async (userId) => {
  try {
    const responsesRef = collection(db, 'survey_responses');
    const q = query(
      responsesRef, 
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        date: data.completedAt,
        score: data.score,
        totalCO2: data.totalCO2,
        responses: data.responses,
        timestamp: new Date(data.completedAt).getTime()
      });
    });
    
    return history;
  } catch (error) {
    console.error('Error getting survey history from Firestore:', error);
    // Fall back to local storage
    if (typeof getSurveyHistory === 'function') {
      return await getSurveyHistory();
    }
    return [];
  }
};

// Initialize Firestore with your questions
export const initializeSurveyInFirestore = async () => {
  try {
    const surveyRef = doc(db, 'surveys', 'climate_survey');
    const surveyDoc = await getDoc(surveyRef);
    
    if (!surveyDoc.exists()) {
      // Import your QUESTION_BANK (you'll need to pass it in)
      const questions = [
        // This will be populated with your QUESTION_BANK data
        // We'll structure it for Firestore
      ];
      
      await updateDoc(surveyRef, {
        title: "Climate Impact Survey",
        description: "Measure your environmental footprint",
        questions: questions,
        createdAt: new Date().toISOString(),
        version: "1.0"
      });
      
      console.log('Survey initialized in Firestore');
    }
  } catch (error) {
    console.error('Error initializing survey in Firestore:', error);
  }
};