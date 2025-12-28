import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { 
  Text, 
  ActivityIndicator, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput, 
  Image 
} from 'react-native';
import * as Font from 'expo-font';
import * as WebBrowser from 'expo-web-browser'; // REQUIRED FOR REDIRECT
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { firebase } from '@react-native-firebase/app';

// Screens
import HomeScreen from './HomeScreen';
import ClimateChangeScreen from './ClimateChangeScreen';
import FutureWorld from './FutureWorld';
import ImpactScreen from './ImpactScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import SurveyScreen from './SurveyScreen';
import ArticleDetailScreen from './ArticleDetailScreen';

// Auth
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

// This line tells the browser to close and return to the app after login
WebBrowser.maybeCompleteAuthSession();

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
              text: `SYSTEM INSTRUCTION: You are CanopyX, an expert climate AI using the Gemma 3 model. Only answer questions related to climate change. USER QUESTION: ${userText}`
            }]
          }]
        })
      });
      const data = await response.json();
      const botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting.";
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: "Connection error." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.chatTrigger} onPress={() => setVisible(true)}>
        <View style={styles.placeholderAvatar}>
          <Image source={require('./assets/CanopyX.png')} style={styles.avatarImage} />
        </View>
      </TouchableOpacity>
      <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={() => setVisible(false)}>
        <View style={styles.chatOverlay}>
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatTitle}>CanopyX AI</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.msgList}>{messages.map((m, i) => (
              <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.botBubble]}>
                <Text style={[styles.msgText, m.role === 'user' && {color: '#FFF'}]}>{m.text}</Text>
              </View>
            ))}</ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput style={styles.chatInput} value={input} onChangeText={setInput} onSubmitEditing={sendMessage} placeholder="Ask me..." />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}><Feather name="send" size={20} color="#FFF" /></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ tabBarStyle: { height: 70 }, tabBarActiveTintColor: '#22C55E' }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />, headerShown: false }} />
      <Tab.Screen name="Articles" component={ClimateChangeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="book" size={24} color={color} />, headerShown: false }} />
      <Tab.Screen name="Projections" component={FutureWorld} options={{ tabBarIcon: ({ color }) => <Ionicons name="earth" size={24} color={color} />, headerShown: false }} />
      <Tab.Screen name="Impact" component={ImpactScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} />, headerShown: false }} />
    </Tab.Navigator>
  );
}

function MainApp() {
  const { user, loading } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'Quicksand-Regular': require('./assets/Quicksand-Regular.ttf'),
      'Quicksand-Medium': require('./assets/Quicksand-Medium.ttf'),
      'Quicksand-SemiBold': require('./assets/Quicksand-SemiBold.ttf'),
      'Quicksand-Bold': require('./assets/Quicksand-Bold.ttf'),
    }).then(() => setFontsLoaded(true));
  }, []);

  // Sync Cloud Data to Local Storage
  useEffect(() => {
    if (user) {
      const unsubscribe = firestore()
        .collection('users')
        .doc(user.uid)
        .onSnapshot(doc => {
          if (doc.exists && doc.data().surveyHistory) {
            AsyncStorage.setItem('surveyHistory', JSON.stringify(doc.data().surveyHistory));
          }
        });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
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

const styles = StyleSheet.create({
  chatTrigger: { position: 'absolute', bottom: 90, right: 20, zIndex: 9999 },
  placeholderAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center', elevation: 8, borderWidth: 2, borderColor: '#FFF', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  chatOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  chatContainer: { height: '80%', backgroundColor: '#FFF', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', fontFamily: 'Quicksand-Bold' },
  msgList: { flex: 1, paddingVertical: 10 },
  bubble: { padding: 12, borderRadius: 18, marginVertical: 5, maxWidth: '85%' },
  userBubble: { backgroundColor: '#22C55E', alignSelf: 'flex-end' },
  botBubble: { backgroundColor: '#F3F4F6', alignSelf: 'flex-start' },
  msgText: { fontSize: 15, lineHeight: 22, color: '#374151', fontFamily: 'Quicksand-Medium' },
  chatInputRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  chatInput: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 25, paddingHorizontal: 20, height: 48, marginRight: 10 },
  sendBtn: { backgroundColor: '#22C55E', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
});