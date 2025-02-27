import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      let errorMessage = 'Failed to login';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
      Alert.alert('Error', errorMessage);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-10">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80' }} 
            className="w-32 h-32 rounded-full"
          />
          <Text className="text-3xl font-bold text-primary mt-4">Will She Reply?</Text>
          <Text className="text-text-light text-center mt-2">Chat with AI companions who have unique personalities</Text>
        </View>
        
        <View className="mb-6">
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
        
        <View className="mb-6">
          <Text className="text-text-default mb-2 font-medium">Password</Text>
          <TextInput
            className="bg-white p-4 rounded-lg border border-secondary"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          className="bg-primary p-4 rounded-lg items-center mb-4"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center mb-4"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text className="text-primary-dark">Forgot Password?</Text>
        </TouchableOpacity>
        
        <View className="flex-row justify-center">
          <Text className="text-text-light">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-primary-dark font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;