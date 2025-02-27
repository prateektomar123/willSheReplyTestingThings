import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Bell, Moon, Lock, LogOut, ChevronRight, Shield, HelpCircle, Info } from 'lucide-react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
  });
  const [pushPermission, setPushPermission] = useState(false);
  
  const auth = getAuth();
  const db = getFirestore();
  const userId = auth.currentUser?.uid;

  // Fetch user preferences
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        if (!userId) return;
        
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().preferences) {
          setPreferences(userSnap.data().preferences);
        }
        
        // Check notification permissions
        const { status } = await Notifications.getPermissionsAsync();
        setPushPermission(status === 'granted');
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [userId, db]);

  const updatePreference = async (key, value) => {
    try {
      // Update local state
      setPreferences(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Update in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [`preferences.${key}`]: value
      });
      
      // Handle special cases
      if (key === 'notifications' && value === true) {
        requestNotificationPermission();
      }
    } catch (error) {
      console.error(`Error updating ${key} preference:`, error);
      Alert.alert('Error', `Failed to update ${key} setting`);
      
      // Revert local state on error
      setPreferences(prev => ({
        ...prev,
        [key]: !value
      }));
    }
  };

  const requestNotificationPermission = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert('Notice', 'Push notifications are not available in the simulator');
        return;
      }
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      setPushPermission(finalStatus === 'granted');
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Notifications Disabled',
          'To receive notifications about new messages, please enable notifications in your device settings.'
        );
        
        // Update preference to match actual permission
        updatePreference('notifications', false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleChangePassword = () => {
    // In a real app, you would implement a modal or navigate to a password change screen
    Alert.alert(
      'Change Password',
      'This feature will be available in the next update!',
      [{ text: 'OK' }]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleLogout, style: 'destructive' }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-light">
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView>
        <View className="p-4">
          <Text className="text-xl font-bold text-text-default mb-4">Preferences</Text>
          
          <View className="bg-white rounded-xl overflow-hidden mb-6">
            <View className="flex-row justify-between items-center p-4 border-b border-secondary-light">
              <View className="flex-row items-center">
                <Bell size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Push Notifications</Text>
              </View>
              <Switch
                value={preferences.notifications}
                onValueChange={(value) => updatePreference('notifications', value)}
                trackColor={{ false: '#D1D1D6', true: '#FFB6C1' }}
                thumbColor={preferences.notifications ? '#FF69B4' : '#F4F4F4'}
              />
            </View>
            
            <View className="flex-row justify-between items-center p-4">
              <View className="flex-row items-center">
                <Moon size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Dark Mode</Text>
              </View>
              <Switch
                value={preferences.darkMode}
                onValueChange={(value) => updatePreference('darkMode', value)}
                trackColor={{ false: '#D1D1D6', true: '#FFB6C1' }}
                thumbColor={preferences.darkMode ? '#FF69B4' : '#F4F4F4'}
              />
            </View>
          </View>
          
          <Text className="text-xl font-bold text-text-default mb-4">Account</Text>
          
          <View className="bg-white rounded-xl overflow-hidden mb-6">
            <TouchableOpacity 
              className="flex-row justify-between items-center p-4 border-b border-secondary-light"
              onPress={handleChangePassword}
            >
              <View className="flex-row items-center">
                <Lock size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Change Password</Text>
              </View>
              <ChevronRight size={20} color="#999999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center p-4"
              onPress={confirmLogout}
            >
              <View className="flex-row items-center">
                <LogOut size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Sign Out</Text>
              </View>
              <ChevronRight size={20} color="#999999" />
            </TouchableOpacity>
          </View>
          
          <Text className="text-xl font-bold text-text-default mb-4">Support</Text>
          
          <View className="bg-white rounded-xl overflow-hidden mb-6">
            <TouchableOpacity 
              className="flex-row justify-between items-center p-4 border-b border-secondary-light"
              onPress={() => Alert.alert('Privacy Policy', 'Our privacy policy will be displayed here.')}
            >
              <View className="flex-row items-center">
                <Shield size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color="#999999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center p-4 border-b border-secondary-light"
              onPress={() => Alert.alert('Help Center', 'Our help center will be displayed here.')}
            >
              <View className="flex-row items-center">
                <HelpCircle size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">Help Center</Text>
              </View>
              <ChevronRight size={20} color="#999999" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row justify-between items-center p-4"
              onPress={() => Alert.alert('About', 'Will She Reply? v1.0.0\n\nDeveloped with ❤️')}
            >
              <View className="flex-row items-center">
                <Info size={22} color="#FF69B4" />
                <Text className="text-text-default font-medium ml-3">About</Text>
              </View>
              <Text className="text-text-light text-sm">v1.0.0</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;