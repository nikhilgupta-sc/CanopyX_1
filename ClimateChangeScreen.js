import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import ArticlesTab from './ArticlesTab';
import NewsTab from './NewsTab';

const TopTab = createMaterialTopTabNavigator();

export default function ClimateChangeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
     
        <TopTab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#666666',
            tabBarIndicatorStyle: { backgroundColor: '#4CAF50' },
            tabBarStyle: { backgroundColor: '#FFFFFF' },
            tabBarLabelStyle: { fontWeight: '600' },
          }}
        >
          <TopTab.Screen name="Articles" component={ArticlesTab} />
          <TopTab.Screen name="Latest News" component={NewsTab} />
        </TopTab.Navigator>

    </SafeAreaView>
  );
}