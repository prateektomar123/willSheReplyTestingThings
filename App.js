import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Navigation
import AuthStack from './src/navigation/AuthStack';
import MainTabs from './src/navigation/MainTabs';

// Firebase config
import firebaseConfig from './src/config/firebase';

// Initialize Firebase
initializeApp(firebaseConfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {user ? <MainTabs /> : <AuthStack />}
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}