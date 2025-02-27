import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ChatsListScreen from '../screens/main/ChatsListScreen';
import ChatScreen from '../screens/main/ChatScreen';

const Stack = createNativeStackNavigator();

const ChatsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FF69B4',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ChatsList" 
        component={ChatsListScreen} 
        options={{ title: 'Your Chats' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={({ route }) => ({ title: route.params.companion.name })}
      />
    </Stack.Navigator>
  );
};

export default ChatsNavigator;