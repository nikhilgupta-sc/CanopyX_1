import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, ActivityIndicator, View, Alert } from 'react-native';
import * as Font from 'expo-font';
import HomeScreen from './HomeScreen';
import ClimateChangeScreen from './ClimateChangeScreen';
import FutureWorld from './FutureWorld';
import ImpactScreen from './ImpactScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';
import SurveyScreen from './SurveyScreen';
import { loadData } from './storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import Firebase Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Load Quicksand font with error handling
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
    console.log('Font loading failed, using default fonts');
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Climate" 
        component={ClimateChangeScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
             <Ionicons name="cloudy" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Lessons" 
        component={FutureWorld} 
        options={{
          tabBarIcon: ({ color, size }) => (
           <Ionicons name="book" size={size} color={color}/>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Impact" 
        component={ImpactScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color}/>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Component with Firebase Auth Integration
function MainApp() {
  const { user, loading, authError } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    const loadAppResources = async () => {
      try {
        const fontsLoadedSuccess = await loadFonts();
        setFontsLoaded(fontsLoadedSuccess);
        
        // If fonts fail to load, we can still proceed
        if (!fontsLoadedSuccess) {
          console.log('Proceeding without custom fonts');
        }
      } catch (error) {
        console.error('Resource loading error:', error);
        setAppError(error.message);
      }
    };

    loadAppResources();
  }, []);

  // Show auth errors
  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      // You can show an alert here if needed
      // Alert.alert('Auth Error', authError.message);
    }
  }, [authError]);

  // Show loading screen
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={{ marginTop: 10, fontFamily: 'Quicksand-Medium' }}>
          Loading...
        </Text>
        {authError && (
          <Text style={{ marginTop: 10, color: 'red', textAlign: 'center', padding: 20 }}>
            Auth Error: {authError.message}
          </Text>
        )}
      </View>
    );
  }

  // If fonts are still loading but auth is ready, proceed without custom fonts
  if (!fontsLoaded) {
    console.log('Rendering app without custom fonts');
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // App screens when logged in
          <>
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="Survey" component={SurveyScreen} />
          </>
        ) : (
          // Auth screens when logged out
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root App Component that wraps everything with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}