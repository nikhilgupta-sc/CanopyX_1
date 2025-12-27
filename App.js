import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  Text, 
  ActivityIndicator, 
  View, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput, 
  Dimensions,
  Image // Added Image import
} from 'react-native';
import * as Font from 'expo-font';
import HomeScreen from './HomeScreen';
import ClimateChangeScreen from './ClimateChangeScreen';
import FutureWorld from './FutureWorld';
import ImpactScreen from './ImpactScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import SurveyScreen from './SurveyScreen';
import ArticleDetailScreen from './ArticleDetailScreen';
import { firebase } from '@react-native-firebase/app';
import { loadData } from './storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// Import Firebase Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

if (!firebase.apps.length) {
  firebase.initializeApp();
}

// --- CANOPYX CHATBOT COMPONENT ---
const CanopyXChat = () => {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am CanopyX, your Gemma 3 powered climate assistant. How can I help you today?' }
  ]);

  // Replace with your Google AI Studio API Key
  const GOOGLE_API_KEY = "AIzaSyAPfY7K4_buqxETMRLzfxSfVytWmsBJn4A"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${GOOGLE_API_KEY}`;

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `SYSTEM INSTRUCTION: You are CanopyX, an expert climate AI using the Gemma 3 model. 
              Only answer questions related to climate change, sustainability, and environmental science. 
              If the user asks about something else, politely redirect them back to climate topics.
              USER QUESTION: ${userText}`
            }]
          }]
        })
      });
      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to my climate database.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.chatTrigger} onPress={() => setVisible(true)}>
        <View style={styles.placeholderAvatar}>
          {/* Replaced Text with Image component */}
          <Image 
            source={require('./assets/CanopyX.png')} 
            style={styles.avatarImage} 
          />
        </View>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.activePulse} />
                <Text style={styles.chatTitle}>CanopyX AI</Text>
              </View>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.msgList} showsVerticalScrollIndicator={false}>
              {messages.map((m, i) => (
                <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.msgText, m.role === 'user' && {color: '#FFF'}]}>{m.text}</Text>
                </View>
              ))}
              {isTyping && <ActivityIndicator size="small" color="#22C55E" style={{margin: 15, alignSelf: 'flex-start'}} />}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput 
                style={styles.chatInput} 
                placeholder="Ask about global warming..." 
                value={input} 
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Feather name="send" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- FONT LOADING ---
const loadFonts = async () => {
  try {
    await Font.loadAsync({
      'Quicksand-Regular': require('./assets/Quicksand-Regular.ttf'),
      'Quicksand-Medium': require('./assets/Quicksand-Medium.ttf'),
      'Quicksand-SemiBold': require('./assets/Quicksand-SemiBold.ttf'),
      'Quicksand-Bold': require('./assets/Quicksand-Bold.ttf'),
    });
    return true;
  } catch (error) {
    console.log('Font loading failed');
    return false;
  }
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Quicksand-Medium',
          fontSize: 12,
        },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />, headerShown: false }} />
      <Tab.Screen name="Articles" component={ClimateChangeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />, headerShown: false }} />
      <Tab.Screen name="Projections" component={FutureWorld} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="earth" size={size} color={color}/>, headerShown: false }} />
      <Tab.Screen name="Impact" component={ImpactScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color}/>, headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user, loading, authError } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts().then(success => setFontsLoaded(success));
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
    // Add this inside a useEffect in MainApp (App.js)
useEffect(() => {
  if (user) {
    // This "Snapshot" listener stays open and watches for cloud changes
    const unsubscribe = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(documentSnapshot => {
        if (documentSnapshot.exists) {
          const data = documentSnapshot.data();
          // Automatically update local storage whenever the cloud changes
          if (data.surveyHistory) {
            AsyncStorage.setItem('surveyHistory', JSON.stringify(data.surveyHistory));
          }
        }
      });

    return () => unsubscribe(); // Stop listening when user logs out
  }
}, [user]);
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <>
              <Stack.Screen name="MainApp" component={TabNavigator} />
              <Stack.Screen name="Survey" component={SurveyScreen} />
              <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Renders AI Bot on top of all screens only when user is logged in */}
      {user && <CanopyXChat />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  chatTrigger: {
    position: 'absolute',
    bottom: 90, 
    right: 20, // Moved to right side
    zIndex: 9999,
  },
  placeholderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden', // Ensures image is clipped to circle
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  chatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatContainer: { height: '80%', backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Quicksand-Bold' },
  activePulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 8 },
  msgList: { flex: 1, paddingVertical: 10 },
  bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '85%' },
  userBubble: { backgroundColor: '#22C55E', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  msgText: { fontSize: 15, lineHeight: 22, color: '#374151', fontFamily: 'Quicksand-Medium' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chatInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 25, paddingHorizontal: 20, height: 48, marginRight: 10, fontFamily: 'Quicksand-Medium' },
  sendBtn: { backgroundColor: '#22C55E', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});