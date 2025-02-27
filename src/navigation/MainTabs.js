import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageCircle, Users, CreditCard, Settings } from 'lucide-react';

// Screens
import ChatsNavigator from './ChatsNavigator';
import ProfilesScreen from '../screens/main/ProfilesScreen';
import CreditsScreen from '../screens/main/CreditsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF69B4',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          backgroundColor: '#FFF0F5',
          borderTopColor: '#FFD1E8',
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: '#FF69B4',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatsNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profiles" 
        component={ProfilesScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Credits" 
        component={CreditsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <CreditCard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;