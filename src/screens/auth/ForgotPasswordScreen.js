import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    const auth = getAuth();
    
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <View className="flex-1 p-6 justify-center">
        <TouchableOpacity 
          className="absolute top-6 left-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-primary-dark font-bold">Back</Text>
        </TouchableOpacity>
        
        <View className="items-center mb-10">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80' }} 
            className="w-24 h-24 rounded-full"
          />
          <Text className="text-2xl font-bold text-primary mt-4">Reset Password</Text>
          <Text className="text-text-light text-center mt-2">
            {emailSent 
              ? 'Check your email for reset instructions' 
              : 'Enter your email to receive password reset instructions'}
          </Text>
        </View>
        
        {!emailSent ? (
          <>
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
            
            <TouchableOpacity 
              className="bg-primary p-4 rounded-lg items-center mb-4"
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-lg">Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            className="bg-primary p-4 rounded-lg items-center mb-4"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-white font-bold text-lg">Back to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;