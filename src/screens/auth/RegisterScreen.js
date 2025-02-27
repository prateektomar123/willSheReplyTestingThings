import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    const db = getFirestore();
    
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date(),
        credits: 10, // Starting credits
        preferences: {
          darkMode: false,
          notifications: true
        }
      });
      
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      let errorMessage = 'Failed to register';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 justify-center">
          <View className="items-center mb-8">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80' }} 
              className="w-24 h-24 rounded-full"
            />
            <Text className="text-2xl font-bold text-primary mt-4">Create Account</Text>
            <Text className="text-text-light text-center mt-2">Join and start chatting with AI companions</Text>
          </View>
          
          <View className="mb-4">
            <Text className="text-text-default mb-2 font-medium">Name</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-secondary"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-text-default mb-2 font-medium">Email</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-secondary"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View className="mb-4">
            <Text className="text-text-default mb-2 font-medium">Password</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-secondary"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <View className="mb-6">
            <Text className="text-text-default mb-2 font-medium">Confirm Password</Text>
            <TextInput
              className="bg-white p-4 rounded-lg border border-secondary"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            className="bg-primary p-4 rounded-lg items-center mb-4"
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign Up</Text>
            )}
          </TouchableOpacity>
          
          <View className="flex-row justify-center">
            <Text className="text-text-light">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-primary-dark font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;